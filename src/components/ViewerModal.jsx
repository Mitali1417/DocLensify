import { useState } from "react";
import {
  IoClose,
  IoDownloadOutline,
  IoExpandOutline,
  IoContractOutline,
  IoSyncOutline,
} from "react-icons/io5";

export default function ViewerModal({ doc, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [activeView, setActiveView] = useState("comparison");

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || "document.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-5 animate-in fade-in duration-300 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card-dark rounded-2xl max-w-7xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-border-dark animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-border-dark flex flex-wrap justify-between items-center gap-4 bg-card-dark">
          <div>
            <h3 className="text-xl font-bold text-white leading-tight">
              {doc.filename || "Untitled Document"}
            </h3>
            <p className="text-xs text-muted-grey font-medium">
              Captured on {formatDate(doc.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-bg-dark p-1 rounded-xl border border-border-dark">
              {["comparison", "original", "processed"].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`
                    px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-200
                    ${
                      activeView === view
                        ? "bg-blue-500 text-white shadow-lg"
                        : "text-muted-grey hover:text-white"
                    }
                  `}
                >
                  {view === "comparison" ? "Compare" : view}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-dark text-muted-grey hover:bg-red-500/20 hover:text-red-500 border border-border-dark transition-all duration-200"
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-bg-dark relative custom-scrollbar">
          <div
            className={`flex h-full min-h-[500px] ${activeView !== "comparison" ? "flex-col" : "flex-row"}`}
          >
            {/* Original Pane */}
            {(activeView === "comparison" || activeView === "original") && (
              <div className="flex-1 p-6 flex flex-col">
                <span className="text-xs font-bold text-muted-grey mb-3">
                  Original View
                </span>
                <div className="flex-1 bg-card-dark/50 rounded-xl aspect-video shadow-inner border border-border-dark overflow-hidden flex items-center justify-center">
                  <img
                    src={doc.originalUrl}
                    alt="Original"
                    className="max-w-full max-h-full object-contain transition-transform duration-300"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>
              </div>
            )}

            {activeView === "comparison" && (
              <div className="w-px bg-linear-to-b from-transparent via-border-dark to-transparent my-10" />
            )}

            {/* Processed Pane */}
            {(activeView === "comparison" || activeView === "processed") && (
              <div className="flex-1 p-6 flex flex-col">
                <span className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-1">
                  Enhanced Scan
                </span>
                <div className="flex-1 bg-card-dark/50 rounded-xl aspect-video shadow-inner border border-blue-500/20 overflow-hidden flex items-center justify-center">
                  <img
                    src={doc.processedUrl}
                    alt="Processed"
                    className="max-w-full max-h-full object-contain transition-transform duration-300"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-2 border-t border-border-dark flex flex-wrap justify-between items-center gap-4 bg-card-dark">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-grey mr-2 uppercase tracking-tighter">
              Zoom
            </span>
            <div className="flex items-center bg-bg-dark rounded-lg border border-border-dark p-1">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                className="p-2 hover:bg-card-dark rounded-md transition-colors text-white"
              >
                <IoContractOutline />
              </button>
              <span className="text-xs font-bold w-12 text-center text-white">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                className="p-2 hover:bg-card-dark rounded-md transition-colors text-white"
              >
                <IoExpandOutline />
              </button>
            </div>
            <button
              onClick={() => setZoom(1)}
              className="ml-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              <IoSyncOutline /> Reset
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                handleDownload(doc.originalUrl, `original_${doc.filename}`)
              }
              className="px-5 py-2.5 rounded-lg border border-border-dark text-sm text-white hover:bg-bg-dark transition-all flex items-center gap-2"
            >
              Original
            </button>
            <button
              onClick={() =>
                handleDownload(doc.processedUrl, `scanned_${doc.filename}`)
              }
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm shadow-lg shadow-blue-900/40 hover:bg-blue-500 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <IoDownloadOutline size={18} />
              Download Scan
            </button>
          </div>
        </div>

        {doc.detectionSuccess === false && (
          <div className="px-6 py-3 bg-blue-500/10 border-t border-blue-500/20 flex items-center gap-3">
            <p className="text-xs text-blue-100/80 font-medium">
              Pro Tip: To get a perfect edge detection next time, try using a
              surface that is a different color than your document! You're doing
              great!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
