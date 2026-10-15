import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function ImageViewer({ src, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation(); // don't also close a modal or drawer underneath
      onClose();
    };
    window.addEventListener("keydown", onKey, true); // capture: runs before the others
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
      onMouseDown={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        onMouseDown={(e) => e.stopPropagation()}
        aria-label="Close"
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X size={22} />
      </button>

      <img
        src={src}
        alt="Full size"
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[90dvh] max-w-[95vw] rounded-lg object-contain"
      />
    </div>,
    document.body
  );
}