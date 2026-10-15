import { X } from "lucide-react";

export default function ImagePreview({ src, name, disabled, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-3 pt-3 sm:px-8 sm:pt-4">
      <div className="relative">
        <img src={src} alt="Selected" className="h-20 w-20 rounded-xl border border-line object-cover" />
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove image"
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow transition-colors hover:bg-red-500 disabled:opacity-60"
        >
          <X size={14} />
        </button>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm text-gray-200">{name}</p>
        <p className="text-xs text-muted">Add a caption below, then press send.</p>
      </div>
    </div>
  );
}