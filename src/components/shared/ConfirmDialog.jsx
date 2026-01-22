import { CgDanger } from "react-icons/cg";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-dark border border-border-dark w-full max-w-md rounded-lg p-8 shadow-2xl transform transition-all animate-in zoom-in-95 duration-300">
        <div className="text-center">
          <h3 className="text-2xl flex items-center justify-center text-white mb-3">
            <CgDanger className="text-red-500 inline-block mr-2" />
            {title || "Are you sure you want to proceed?"}
          </h3>
          <p className="text-muted-grey text-sm leading-relaxed mb-8">
            {message ||
              "Every step forward is progress, but make sure you want this!"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg font-bold text-sm text-white bg-white/5 border border-border-dark hover:bg-white/10 hover:border-muted-grey transition-all duration-200 order-2 sm:order-1"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-all duration-200 order-1 sm:order-2"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
