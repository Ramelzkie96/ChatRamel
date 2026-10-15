import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { downloadFile } from "../../utils/api";
import { formatBytes } from "../../utils/formatBytes";

const formatDate = (date) =>
  new Date(date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

// item: a message that has a file
export default function FileItem({ item, chatId }) {
  const [busy, setBusy] = useState(false);
  const { file } = item;

  const download = async () => {
    if (busy) return;
    try {
      setBusy(true);
      await downloadFile(`/messages/${chatId}/files/${item._id}`, file.name);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
        <FileText size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-muted">
          {formatBytes(file.size)} • {formatDate(item.createdAt)}
        </p>
      </div>

      <button
        type="button"
        onClick={download}
        disabled={busy}
        aria-label={`Download ${file.name}`}
        className="text-muted transition-colors hover:text-white disabled:opacity-60"
      >
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
      </button>
    </div>
  );
}