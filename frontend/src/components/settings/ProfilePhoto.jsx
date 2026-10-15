import { useRef } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../ui/Avatar";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 2 * 1024 * 1024;

export default function ProfilePhoto({ user, uploading, onUpload, onRemove }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets you pick the same file again later
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      return toast.error("Only JPG, PNG, WEBP or GIF images are allowed.");
    }
    if (file.size > MAX_BYTES) return toast.error("Image is too large (2 MB max).");

    onUpload(file);
  };

  const pick = () => fileRef.current?.click();

  return (
    <div className="flex flex-wrap items-center gap-5">
      <input
        ref={fileRef}
        type="file"
        accept={ALLOWED.join(",")}
        onChange={handleFile}
        className="hidden"
      />

      <div className="relative">
        <Avatar name={user.name} src={user.avatar} size={96} />

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55">
            <Loader2 className="animate-spin text-white" size={26} />
          </div>
        )}

        <button
          type="button"
          onClick={pick}
          disabled={uploading}
          aria-label="Change profile photo"
          className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-panel bg-hover text-white transition-colors hover:bg-accent disabled:opacity-60"
        >
          <Camera size={16} />
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-xl font-semibold">{user.name}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Online
        </p>
        {user.username && <p className="truncate text-sm text-muted">@{user.username}</p>}
      </div>

      <div className="flex flex-col items-stretch gap-2">
        <button
          type="button"
          onClick={pick}
          disabled={uploading}
          className="flex items-center justify-center gap-2 rounded-xl border border-accent px-4 py-2.5 text-sm font-medium text-blue-300 transition-colors hover:bg-accent/15 disabled:opacity-60"
        >
          <Camera size={16} /> Change Photo
        </button>

        {user.avatar && (
          <button
            type="button"
            onClick={onRemove}
            disabled={uploading}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm text-muted transition-colors hover:text-red-400 disabled:opacity-60"
          >
            <Trash2 size={15} /> Remove photo
          </button>
        )}
      </div>
    </div>
  );
}