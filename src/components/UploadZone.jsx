import { useState } from "react";
import { db, auth } from "../services/firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { processDocument } from "../utils/cvUtils";
import { CgSpinner, CgSpinnerAlt } from "react-icons/cg";
import { IoCloudUploadSharp } from "react-icons/io5";
import Toast from "./shared/Toast";
import { uploadToCloudinary } from "../services/cloudinary/cloudinary";
import { pdfToCanvas } from "../services/pdfService";


export default function UploadZone() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

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
        sourceElement = await pdfToCanvas(file);
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
      setProgress("Uploading original...");
      const originalUpload = await uploadToCloudinary(file, {
        isOriginal: true,
      });

      setProgress("Uploading processed...");
      const processedUpload = await uploadToCloudinary(processedBlob);

      const origUrl = originalUpload.secure_url;
      const procUrl = processedUpload.secure_url;

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
          message: "Document can't be processed. Saving as original!",
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
    <div className="text-center sm:py-10">
      {error && (
        <div className="bg-red-100/10 text-red-600 p-3 rounded-lg mb-5 text-sm font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <label
        htmlFor="file-input"
        className={`
        block w-full p-10 rounded-lg border border-dashed transition-all duration-500
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
