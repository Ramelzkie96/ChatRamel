import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  MessageCircle,
  Phone,
  Video,
  Star,
  Ban,
  UserMinus,
} from "lucide-react";
import ConfirmModal from "../modals/ConfirmModal";
import useCall from "../../hooks/useCall";

export default function ContactMenu({ item, actions }) {
  const { inCall } = useCall();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null); // "block" | "remove"
  const wrapRef = useRef(null);
  const person = item.user;

  useEffect(() => {
    if (!open) return;

    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const entries = [
    { id: "message", label: "Message", icon: MessageCircle, run: () => actions.message(person) },
    {
      id: "voice",
      label: "Voice call",
      icon: Phone,
      disabled: inCall,
      run: () => actions.call(person, "audio"),
    },
    {
      id: "video",
      label: "Video call",
      icon: Video,
      disabled: inCall,
      run: () => actions.call(person, "video"),
    },
    {
      id: "favorite",
      label: item.favorite ? "Remove from favorites" : "Add to favorites",
      icon: Star,
      run: () => actions.toggleFavorite(item),
    },
    { id: "block", label: "Block", icon: Ban, danger: true, run: () => setModal("block") },
    { id: "remove", label: "Remove from contacts", icon: UserMinus, danger: true, run: () => setModal("remove") },
  ];

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Options for ${person.name}`}
        aria-expanded={open}
        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-hover hover:text-white"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-xl border border-line bg-panel py-1 shadow-2xl shadow-black/50">
          {entries.map(({ id, label, icon: Icon, run, danger, disabled }) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => {
                setOpen(false);
                run();
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${
                danger ? "text-red-400 hover:text-red-300" : "text-gray-200 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      )}

      {modal === "block" && (
        <ConfirmModal
          danger
          title={`Block ${person.name}?`}
          message={`${person.name} won't be able to message or call you, and you won't be able to message or call them. They won't be notified, and you can unblock at any time.`}
          confirmLabel="Block"
          onConfirm={() => actions.block(person)}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "remove" && (
        <ConfirmModal
          danger
          title="Remove from contacts?"
          message={`${person.name} will be removed from your contacts. Your chat history with them stays, and they won't be told.`}
          confirmLabel="Remove"
          onConfirm={() => actions.remove(person)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}