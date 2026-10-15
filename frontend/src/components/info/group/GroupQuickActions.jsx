import { useEffect, useRef, useState } from "react";
import { UserPlus, Search, MoreHorizontal, Pencil, Camera, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 2 * 1024 * 1024;

function Action({ label, icon: Icon, onClick, disabled, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="group flex flex-col items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-hover text-gray-200 transition-colors group-enabled:group-hover:bg-accent group-enabled:group-hover:text-white">
        <Icon size={20} />
      </span>
      <span className="text-sm text-gray-300">{label}</span>
    </button>
  );
}

export default function GroupQuickActions({
  isAdmin,
  uploading,
  onAdd,
  onEdit,
  onChangePhoto,
  onOpenMedia,
}) {
  const [menu, setMenu] = useState(false);
  const wrapRef = useRef(null);
  const fileRef = useRef(null);

  // close the menu on outside click or Esc
  useEffect(() => {
    if (!menu) return;

    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setMenu(false);
    };
    const onKey = (e) => e.key === "Escape" && setMenu(false);

    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets you pick the same file again later
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      return toast.error("Only JPG, PNG, WEBP or GIF images are allowed.");
    }
    if (file.size > MAX_BYTES) return toast.error("Image is too large (2 MB max).");

    onChangePhoto(file);
  };

  const run = (fn) => () => {
    setMenu(false);
    fn();
  };

  const rowClass =
    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-gray-200 transition-colors hover:bg-hover hover:text-white";

  return (
    <div className="flex justify-center gap-8 px-6 py-5">
      <Action
        label="Add"
        icon={UserPlus}
        onClick={onAdd}
        disabled={!isAdmin}
        title={isAdmin ? undefined : "Only admins can add members"}
      />
      <Action
        label="Search"
        icon={Search}
        onClick={() => toast("Message search is coming soon.")}
      />

      <div ref={wrapRef} className="relative">
        {/* stays mounted so the file picker keeps working after the menu closes */}
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED.join(",")}
          onChange={handleFile}
          className="hidden"
        />

        <Action label="More" icon={MoreHorizontal} onClick={() => setMenu((v) => !v)} />

        {menu && (
          <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-panel py-1 shadow-2xl shadow-black/50">
            {isAdmin && (
              <button type="button" className={rowClass} onClick={run(onEdit)}>
                <Pencil size={18} /> Edit group
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                className={rowClass}
                disabled={uploading}
                onClick={run(() => fileRef.current?.click())}
              >
                <Camera size={18} /> Change group photo
              </button>
            )}
            <button type="button" className={rowClass} onClick={run(onOpenMedia)}>
              <ImageIcon size={18} /> Media &amp; Files
            </button>
          </div>
        )}
      </div>
    </div>
  );
}