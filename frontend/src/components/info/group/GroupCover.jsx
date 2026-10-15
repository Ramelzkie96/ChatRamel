import { useRef } from "react";
import { Pencil, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 2 * 1024 * 1024;

export default function GroupCover({ src, name, canEdit, uploading, onPick }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets you pick the same file again later
    if (!file) return;

    if (!ALLOWED.includes(file.type)) return toast.error("Only JPG, PNG, WEBP or GIF images are allowed.");
    if (file.size > MAX_BYTES) return toast.error("Image is too large (2 MB max).");

    onPick(file);
  };

  return (
    <div className="relative mx-5 mt-5 h-32 overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-indigo-900">
      {src && <img src={src} alt={`${name} cover`} className="h-full w-full object-cover" />}

      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="animate-spin text-white" size={26} />
        </div>
      )}

      {canEdit && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED.join(",")}
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            aria-label="Change cover photo"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white transition-colors hover:bg-black/70 disabled:opacity-60"
          >
            <Pencil size={15} />
          </button>
        </>
      )}
    </div>
  );
}