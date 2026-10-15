import { useState } from "react";
import SectionTitle from "../ui/SectionTitle";
import ImageViewer from "../chat/ImageViewer";
import MediaFilesModal from "../modals/MediaFilesModal";
import useSharedMedia from "../../hooks/useSharedMedia";
import { assetUrl } from "../../utils/api";

const PREVIEW = 4;

export default function MediaGrid({ chatId }) {
  const { items, loading } = useSharedMedia(chatId, "images", { limit: PREVIEW });
  const [viewing, setViewing] = useState("");
  const [open, setOpen] = useState(false);

  const shown = items.slice(0, PREVIEW);

  return (
    <section className="border-t border-line px-6 py-5">
      <SectionTitle withArrow={shown.length > 0} onClick={() => setOpen(true)}>
        Media
      </SectionTitle>

      {loading && <p className="text-sm text-muted">Loading...</p>}

      {!loading && shown.length === 0 && <p className="text-sm text-muted">No media shared yet.</p>}

      <div className="flex gap-2">
        {shown.map((item) => (
          <button
            key={item._id}
            type="button"
            onClick={() => setViewing(assetUrl(item.image))}
            aria-label="Open image"
            className="cursor-zoom-in"
          >
            <img
              src={assetUrl(item.image)}
              alt="Shared media"
              loading="lazy"
              className="h-16 w-16 rounded-lg object-cover"
            />
          </button>
        ))}
      </div>

      {viewing && <ImageViewer src={viewing} onClose={() => setViewing("")} />}
      {open && <MediaFilesModal chatId={chatId} initialTab="images" onClose={() => setOpen(false)} />}
    </section>
  );
}