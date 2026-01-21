import { useState } from "react";

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
      alert("Download failed. Please try again.");
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
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "16px",
          maxWidth: "1400px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 4px 0",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              {doc.filename || "Untitled Document"}
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
              {formatDate(doc.createdAt)}
            </p>
          </div>

          {/* View Toggle */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                background: "#f3f4f6",
                borderRadius: "8px",
                padding: "4px",
              }}
            >
              {["comparison", "original", "processed"].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  style={{
                    padding: "8px 16px",
                    background: activeView === view ? "white" : "transparent",
                    color: activeView === view ? "#111827" : "#6b7280",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                    textTransform: "capitalize",
                    transition: "all 0.2s",
                    boxShadow:
                      activeView === view
                        ? "0 1px 3px rgba(0,0,0,0.1)"
                        : "none",
                  }}
                >
                  {view === "comparison" ? "Compare" : view}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#e5e7eb")}
              onMouseLeave={(e) => (e.target.style.background = "#f3f4f6")}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Image Viewer */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            background: "#f9fafb",
            position: "relative",
          }}
        >
          {activeView === "comparison" ? (
            <div
              style={{
                display: "flex",
                height: "100%",
                minHeight: "500px",
              }}
            >
              {/* Original */}
              <div
                style={{
                  flex: 1,
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#6b7280",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Original
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "white",
                    borderRadius: "8px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={doc.originalUrl}
                    alt="Original"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      transform: `scale(${zoom})`,
                    }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  width: "2px",
                  background:
                    "linear-gradient(to bottom, transparent, #d1d5db 50%, transparent)",
                  margin: "24px 0",
                }}
              />

              {/* Processed */}
              <div
                style={{
                  flex: 1,
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#10b981",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Scanned
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "white",
                    borderRadius: "8px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={doc.processedUrl}
                    alt="Processed"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      transform: `scale(${zoom})`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "24px",
                height: "100%",
                minHeight: "500px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: activeView === "processed" ? "#10b981" : "#6b7280",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {activeView === "processed" ? "✨ Scanned" : "Original"}
              </div>
              <div
                style={{
                  flex: 1,
                  background: "white",
                  borderRadius: "8px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={
                    activeView === "original"
                      ? doc.originalUrl
                      : doc.processedUrl
                  }
                  alt={activeView}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    transform: `scale(${zoom})`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          {/* Zoom Controls */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span
              style={{ fontSize: "13px", color: "#6b7280", marginRight: "8px" }}
            >
              Zoom:
            </span>
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              disabled={zoom <= 0.5}
              style={{
                padding: "6px 12px",
                background: zoom <= 0.5 ? "#f3f4f6" : "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                cursor: zoom <= 0.5 ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              −
            </button>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "500",
                minWidth: "45px",
                textAlign: "center",
              }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              disabled={zoom >= 3}
              style={{
                padding: "6px 12px",
                background: zoom >= 3 ? "#f3f4f6" : "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                cursor: zoom >= 3 ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              +
            </button>
            <button
              onClick={() => setZoom(1)}
              style={{
                padding: "6px 12px",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                marginLeft: "4px",
              }}
            >
              Reset
            </button>
          </div>

          {/* Download Buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() =>
                handleDownload(doc.originalUrl, `original_${doc.filename}`)
              }
              style={{
                padding: "8px 16px",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#f9fafb")}
              onMouseLeave={(e) => (e.target.style.background = "white")}
            >
              Original
            </button>
            <button
              onClick={() =>
                handleDownload(doc.processedUrl, `scanned_${doc.filename}`)
              }
              style={{
                padding: "8px 16px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#2563eb")}
              onMouseLeave={(e) => (e.target.style.background = "#3b82f6")}
            >
              ✨ Download Scanned
            </button>
          </div>
        </div>

        {doc.detectionSuccess === false && (
          <div
            style={{
              padding: "12px 24px",
              background: "#fef3c7",
              borderTop: "1px solid #fbbf24",
              fontSize: "13px",
              color: "#92400e",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>
              Document edges were not detected. Showing original image. For
              better results, try retaking with better lighting and a
              contrasting background.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
