import { useState } from "react";
import { db, auth } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { processDocument } from "../utils/cvUtils";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const processPdf = async (file) => {
  const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas;
};

export default function UploadZone() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const uploadToCloudinary = async (fileBlob, isOriginal = false) => {
    setProgress(
      isOriginal ? "Uploading original..." : "Uploading processed...",
    );

    const formData = new FormData();
    formData.append("file", fileBlob);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
    );
    return res.data.secure_url;
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PNG, JPEG, or PDF file");
      return;
    }

    if (!window.cv) {
      setError(
        "Scanner is still loading... Please wait a moment and try again",
      );
      return;
    }

    setLoading(true);
    setError("");
    setProgress("Loading image...");

    try {
      let sourceElement;

      // Handle PDF vs Image
      if (file.type === "application/pdf") {
        setProgress("Converting PDF page...");
        sourceElement = await processPdf(file);
      } else {
        sourceElement = new Image();
        sourceElement.src = URL.createObjectURL(file);
        await new Promise((resolve, reject) => {
          sourceElement.onload = resolve;
          sourceElement.onerror = () =>
            reject(new Error("Failed to load image"));
        });
      }

      // Process the document
      setProgress("Detecting document edges...");
      const { blob: processedBlob, didDetect } =
        await processDocument(sourceElement);

      // Upload both versions
      setProgress("Uploading files...");
      const [origUrl, procUrl] = await Promise.all([
        uploadToCloudinary(file, true),
        uploadToCloudinary(processedBlob, false),
      ]);

      // Save to Firestore
      setProgress("Saving to gallery...");
      await addDoc(collection(db, "documents"), {
        userId: auth.currentUser.uid,
        filename: file.name,
        originalUrl: origUrl,
        processedUrl: procUrl,
        status: didDetect ? "processed" : "original",
        detectionSuccess: didDetect,
        createdAt: Date.now(),
        timestamp: new Date().toISOString(),
      });

      setProgress("");

      if (didDetect) {
        alert("Document scanned successfully!");
      } else {
        alert(
          "Could not detect document edges. Saved original image instead. Try:\n• Better lighting\n• Clearer background\n• Flatter document",
        );
      }

      // Reset file input
      e.target.value = "";
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Processing failed. Please try again.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h2 style={{ fontWeight: "400", marginBottom: "20px" }}></h2>

      {error && (
        <div
          style={{
            background: "#fee",
            color: "#c33",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      <label
        htmlFor="file-input"
        style={{
          cursor: loading ? "not-allowed" : "pointer",
          padding: "30px",
          border: "2px dashed var(--card)",
          backgroundColor: "var(--border)",
          borderRadius: "12px",
          display: "block",
          transition: "all 0.2s",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <input
          id="file-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          onChange={handleFile}
          disabled={loading}
          style={{ display: "none" }}
        />

        <div style={{ fontSize: "48px", marginBottom: "10px" }}>
          {loading ? "⏳" : "📁"}
        </div>

        <h5 style={{ fontSize: "16px", fontWeight: "600" }}>
          {loading ? progress || "Processing..." : "Click to Upload Document"}
        </h5>

        <div style={{ fontSize: "12px", marginTop: "8px" }}>
          Supports PNG, JPEG, and PDF files
        </div>
      </label>

      {loading && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f0f9ff",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#0369a1",
          }}
        >
          <div
            className="loading-spinner"
            style={{
              display: "inline-block",
              width: "16px",
              height: "16px",
              border: "2px solid #0369a1",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
              marginRight: "8px",
            }}
          />
          {progress}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
