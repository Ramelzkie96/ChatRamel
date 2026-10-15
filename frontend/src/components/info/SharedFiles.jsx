import { useState } from "react";
import FileItem from "./FileItem";
import SectionTitle from "../ui/SectionTitle";
import MediaFilesModal from "../modals/MediaFilesModal";
import useSharedMedia from "../../hooks/useSharedMedia";

const PREVIEW = 3;

export default function SharedFiles({ chatId }) {
  const { items, loading, hasMore } = useSharedMedia(chatId, "files", { limit: PREVIEW });
  const [open, setOpen] = useState(false);

  const shown = items.slice(0, PREVIEW);
  const hasMoreFiles = hasMore || items.length > PREVIEW;

  return (
    <section className="border-t border-line px-6 py-5">
      <SectionTitle withArrow={hasMoreFiles} onClick={() => setOpen(true)}>
        Shared Files
      </SectionTitle>

      {loading && <p className="text-sm text-muted">Loading...</p>}

      {!loading && shown.length === 0 && <p className="text-sm text-muted">No files shared yet.</p>}

      <div className="flex flex-col gap-4">
        {shown.map((item) => (
          <FileItem key={item._id} item={item} chatId={chatId} />
        ))}
      </div>

      {open && <MediaFilesModal chatId={chatId} initialTab="files" onClose={() => setOpen(false)} />}
    </section>
  );
}