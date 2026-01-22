import { useEffect, useState } from "react";
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
import {
  IoTrashOutline,
  IoCheckmarkCircle,
  IoDocumentTextOutline,
} from "react-icons/io5";
import { auth, db } from "../services/firebase/firebase";
import ConfirmDialog from "./shared/ConfirmDialog";

export default function Gallery() {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  const openDeleteDialog = (docId, e) => {
    e.stopPropagation();
    setItemToDelete(docId);
    setIsDialogOpen(true);
  };

  // 🚀 Step 2: The actual Firebase deletion
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, "documents", itemToDelete));
      console.log("Masterpiece removed! 🧹");
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDialogOpen(false);
      setItemToDelete(null);
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
      <div className="py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-pulse">
          <div className="space-y-3">
            <div className="h-8 w-64 bg-border-dark/40 rounded-lg" />
            <div className="h-4 w-40 bg-border-dark/30 rounded-lg" />
          </div>
          <div className="h-10 w-72 bg-border-dark/40 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-card-dark rounded-2xl overflow-hidden border border-border-dark/50 animate-pulse aspect-video"
            >
              <div className="aspect-[1/1.41] bg-border-dark/20 relative">
                <div className="absolute top-3 right-3 h-6 w-20 bg-border-dark/40 rounded-full" />
              </div>

              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-border-dark/40 rounded" />
                <div className="h-3 w-1/2 bg-border-dark/20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Delete Scan"
        message="Are you sure you want to remove this scan from your gallery?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDialogOpen(false)}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">
            Your Success Library
          </h3>
          <p className="text-muted-grey text-sm">
            {docs.length} {docs.length === 1 ? "document" : "documents"} safely
            stored. Keep it up!
          </p>
        </div>

        <div className="flex bg-card-dark p-1 rounded-xl border border-border-dark">
          {["all", "processed", "original"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200
                ${
                  filter === f
                    ? "bg-muted-grey text-white shadow-lg"
                    : "text-muted-grey hover:text-white"
                }
              `}
            >
              {f === "all" ? "All" : f === "processed" ? "Scanned" : "Original"}
            </button>
          ))}
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="text-center py-24 bg-card-dark rounded-3xl border-2 border-dashed border-border-dark animate-in fade-in zoom-in duration-300">
          <h4 className="text-xl font-bold text-white mb-2">
            {filter === "all"
              ? "A clean slate! Ready to scan? 🚀"
              : "No documents match this filter."}
          </h4>
          <p className="text-muted-grey">
            Upload your first document to begin your journey!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="group relative bg-card-dark rounded-2xl overflow-hidden border border-border-dark hover:border-blue-500/50 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 cursor-pointer"
              onClick={() => setSelectedDoc(doc)}
            >
              {/* Image Container with A4 Aspect Ratio */}
              <div className="relative aspect-video overflow-hidden bg-bg-dark">
                <img
                  src={doc.processedUrl}
                  alt={doc.filename}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Status Badge */}
                <div
                  className={`
                  absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1
                  ${doc.detectionSuccess ? "bg-emerald-500/90 text-white" : "bg-amber-500/90 text-white"}
                `}
                >
                  {doc.detectionSuccess ? (
                    <IoCheckmarkCircle />
                  ) : (
                    <IoDocumentTextOutline />
                  )}
                  {doc.detectionSuccess ? "Scanned" : "Original"}
                </div>

                <button
                  onClick={(e) => openDeleteDialog(doc.id, e)}
                  className="absolute top-3 left-3 w-10 h-10 rounded-full bg-black/60 text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-200"
                >
                  <IoTrashOutline size={18} />
                </button>
              </div>

              {/* Document Info */}
              <div className="p-4 bg-linear-to-b from-card-dark to-bg-dark">
                <p className="text-white font-bold text-sm truncate mb-1 group-hover:text-blue-400 transition-colors">
                  {doc.filename || "Untitled Masterpiece"}
                </p>
                <p className="text-muted-grey text-[11px] font-medium">
                  Created on {formatDate(doc.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoc && (
        <ViewerModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}
