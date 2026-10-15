import { useEffect } from "react";
import { X } from "lucide-react";

// Stays mounted while closed, so nothing inside it loses its state.
export default function Drawer({ open, side = "right", width = 360, label, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (document.querySelector("[data-modal]")) return; // let an open dialog handle Esc first
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const left = side === "left";

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-40 transition-[visibility] duration-300 ${
        open ? "visible" : "invisible"
      }`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-label={label}
        style={{ maxWidth: width }}
        // no transform while open, so fixed elements inside behave normally
        className={`absolute inset-y-0 w-[90vw] border-line bg-panel shadow-2xl transition-transform duration-300 ${
          left ? "left-0 border-r" : "right-0 border-l"
        } ${open ? "" : left ? "-translate-x-full" : "translate-x-full"}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-hover text-gray-200 transition-colors hover:text-white"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}