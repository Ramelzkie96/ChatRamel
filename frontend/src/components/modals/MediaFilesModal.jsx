import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "../ui/Modal";
import ImageViewer from "../chat/ImageViewer";
import FileItem from "../info/FileItem";
import useSharedMedia from "../../hooks/useSharedMedia";
import { assetUrl } from "../../utils/api";

const TABS = [
  { id: "images", label: "Media" },
  { id: "files", label: "Files" },
];

export default function MediaFilesModal({ chatId, initialTab = "images", onClose }) {
  const [tab, setTab] = useState(initialTab);
  const [viewing, setViewing] = useState("");
  const { items, loading, loadingMore, hasMore, loadMore } = useSharedMedia(chatId, tab, {
    limit: 30,
  });

  return (
    <>
      <Modal title="Media & Files" onClose={onClose}>
        <div className="mb-4 grid grid-cols-2 rounded-xl border border-line bg-[#0a1226] p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg py-2 text-[15px] font-semibold transition-colors ${
                tab === t.id ? "bg-accent text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-10 text-muted">
            <Loader2 className="animate-spin" size={26} />
          </div>
        )}

        {!loading && items.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">
            {tab === "images" ? "No media shared yet." : "No files shared yet."}
          </p>
        )}

        {tab === "images" ? (
          <div className="grid grid-cols-3 gap-2">
            {items.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => setViewing(assetUrl(item.image))}
                aria-label="Open image"
                className="cursor-zoom-in overflow-hidden rounded-lg bg-hover"
              >
                <img
                  src={assetUrl(item.image)}
                  alt="Shared media"
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <FileItem key={item._id} item={item} chatId={chatId} />
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-[15px] text-gray-200 transition-colors hover:bg-hover disabled:opacity-60"
          >
            {loadingMore ? <Loader2 size={18} className="animate-spin" /> : "Load more"}
          </button>
        )}
      </Modal>

      {viewing && <ImageViewer src={viewing} onClose={() => setViewing("")} />}
    </>
  );
}