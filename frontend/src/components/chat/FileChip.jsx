import { FileText, X } from "lucide-react";
import { formatBytes } from "../../utils/formatBytes";

export default function FileChip({ file, disabled, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-8 pt-4">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-line bg-hover text-blue-400">
          <FileText size={32} />
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove file"
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow transition-colors hover:bg-red-500 disabled:opacity-60"
        >
          <X size={14} />
        </button>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm text-gray-200">{file.name}</p>
        <p className="text-xs text-muted">
          {formatBytes(file.size)} • Add a caption below, then press send.
        </p>
      </div>
    </div>
  );
}