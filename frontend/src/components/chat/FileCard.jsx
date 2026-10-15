import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { downloadFile } from "../../utils/api";
import { formatBytes } from "../../utils/formatBytes";

export default function FileCard({ file, chatId, messageId }) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (busy) return;
    try {
      setBusy(true);
      await downloadFile(`/messages/${chatId}/files/${messageId}`, file.name);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      aria-label={`Download ${file.name}`}
      className="flex w-64 max-w-full items-center gap-3 rounded-xl bg-black/20 px-3 py-2.5 text-left transition-colors hover:bg-black/30"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
        <FileText size={22} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{file.name}</span>
        <span className="block text-xs opacity-70">{formatBytes(file.size)}</span>
      </span>

      {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
    </button>
  );
}