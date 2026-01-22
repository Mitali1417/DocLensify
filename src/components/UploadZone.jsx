import { useState } from "react";
import { db, auth } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { processDocument } from "../utils/cvUtils";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";
import { CgSpinner, CgSpinnerAlt } from "react-icons/cg";
import { IoCloudUploadSharp } from "react-icons/io5";
import Toast from "./shared/Toast";

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
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

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

      if (!didDetect) {
        setToast({
          show: true,
          message: "Something went wrong. Please try again.",
          type: "error",
        });
      } else {
        setToast({
          show: true,
          message: "Document successfully processed!",
          type: "success",
        });
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
    <div className="text-center p-10">
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-5 text-sm font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <label
        htmlFor="file-input"
        className={`
        block w-full p-10 rounded-2xl border border-dashed transition-all duration-500
        ${
          loading
            ? "cursor-not-allowed opacity-60 border-border-dark bg-card-dark"
            : "cursor-pointer border-border-dark hover:border-blue-500 hover:bg-card-dark/50 bg-card-dark/60"
        }
      `}
      >
        <input
          id="file-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png,application/pdf"
          onChange={handleFile}
          disabled={loading}
          className="hidden"
        />

        <div
          className={`text-5xl mb-3 flex justify-center ${loading ? "animate-spin text-blue-400" : "text-blue-500"}`}
        >
          {loading ? (
            <CgSpinnerAlt className="animate-spin size-12" />
          ) : (
            <IoCloudUploadSharp />
          )}
        </div>

        <h5
          className={`text-base font-semibold ${loading ? "text-amber-300 animate-pulse" : "text-white"}`}
        >
          {loading
            ? progress || "Processing Document"
            : "Click to Upload Document"}
        </h5>

        <div className="text-xs mt-2 text-muted-grey">
          Supports high-quality PNG, JPEG, and PDF files
        </div>
      </label>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
