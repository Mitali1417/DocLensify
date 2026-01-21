import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import ViewerModal from "./ViewerModal";

export default function Gallery() {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, "documents"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        );

        const unsubscribeDocs = onSnapshot(
          q,
          (snapshot) => {
            setDocs(
              snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
            );
            setLoading(false);
          },
          (error) => {
            console.error("Gallery error:", error);
            setLoading(false);
          },
        );

        return () => unsubscribeDocs();
      } else {
        setDocs([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleDelete = async (docId, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this scan? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "documents", docId));
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete. Please try again.");
      }
    }
  };

  const filteredDocs = docs.filter((doc) => {
    if (filter === "all") return true;
    if (filter === "processed") return doc.detectionSuccess === true;
    if (filter === "original") return doc.detectionSuccess === false;
    return true;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div
          className="loading-spinner"
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f4f6",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ color: "#666" }}>Loading your gallery...</p>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h3 style={{ fontWeight: "500", margin: "0 0 8px 0" }}>
            Your Scanned Documents
          </h3>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
            {docs.length} {docs.length === 1 ? "document" : "documents"} saved
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          {["all", "processed", "original"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                border:
                  filter === f ? "2px solid #3b82f6" : "1px solid #e5e7eb6c",
                background: filter === f ? "#3b83f630" : "var(--background)",
                color: filter === f ? "#3b82f6" : "var(--muted-text)",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                textTransform: "capitalize",
                transition: "all 0.2s",
              }}
            >
              {f === "all"
                ? `All (${docs.length})`
                : f === "processed"
                  ? `Scanned (${docs.filter((d) => d.detectionSuccess).length})`
                  : `Original (${docs.filter((d) => !d.detectionSuccess).length})`}
            </button>
          ))}
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--card)",
            borderRadius: "12px",
            border: "2px dashed var(--border)",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0" }}>
            {filter === "all" ? "No documents yet" : `No ${filter} documents`}
          </h4>
          <p style={{ fontSize: "14px" }}>
            {filter === "all"
              ? "Upload your first document to get started!"
              : `Try changing the filter to see other documents`}
          </p>
        </div>
      ) : (
        <div
          className="grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="gallery-item"
              onClick={() => setSelectedDoc(doc)}
              style={{
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: "all 0.2s",
                background: "white",
              }}
            >
              {/* Image */}
              <div
                style={{
                  position: "relative",
                  paddingTop: "141.4%", // A4 ratio
                  background: "#f3f4f6",
                  overflow: "hidden",
                }}
              >
                <img
                  src={doc.processedUrl}
                  alt={doc.filename || "Scan"}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Status Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    padding: "6px 12px",
                    background: doc.detectionSuccess ? "#10b981" : "#f59e0b",
                    color: "white",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {doc.detectionSuccess ? "✨ Scanned" : "📄 Original"}
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(doc.id, e)}
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.6)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                  className="delete-btn"
                >
                  🗑️
                </button>
              </div>

              {/* Info */}
              <div style={{ padding: "12px" }}>
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#111827",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {doc.filename || "Untitled Document"}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  {formatDate(doc.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoc && (
        <ViewerModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}

      <style>{`
        .gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.15) !important;
        }
        .gallery-item:hover .delete-btn {
          opacity: 1;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
