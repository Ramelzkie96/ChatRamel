import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  MessageCircle,
  ShieldCheck,
  ShieldOff,
  UserMinus,
  UserPlus,
} from "lucide-react";
import useContacts from "../../../hooks/useContacts";
import useContactActions from "../../../hooks/useContactActions";

export default function MemberMenu({ member, viewerIsAdmin, onMessage, onSetRole, onRemove }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const { isContact } = useContacts();
  const contactActions = useContactActions();

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

  const items = [];

  if (!member.isYou) {
    items.push({ id: "message", label: "Message", icon: MessageCircle, run: () => onMessage(member) });

    if (!isContact(member.id)) {
      items.push({
        id: "contact",
        label: "Add to contacts",
        icon: UserPlus,
        run: () => contactActions.add({ _id: member.id, name: member.name }),
      });
    }
  }

  if (viewerIsAdmin) {
    if (member.isAdmin) {
      items.push({
        id: "demote",
        label: member.isYou ? "Step down as admin" : "Remove admin",
        icon: ShieldOff,
        run: () => onSetRole(member, "member"),
      });
    } else {
      items.push({ id: "promote", label: "Make admin", icon: ShieldCheck, run: () => onSetRole(member, "admin") });
    }

    // admins have to be demoted first (the server enforces this too)
    if (!member.isYou && !member.isAdmin) {
      items.push({
        id: "remove",
        label: "Remove from group",
        icon: UserMinus,
        danger: true,
        run: () => onRemove(member),
      });
    }
  }

  // keeps the rows aligned when there's nothing to show (your own row as a regular member)
  if (items.length === 0) return <div className="w-8 shrink-0" />;

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Options for ${member.name}`}
        aria-expanded={open}
        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-hover hover:text-white"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-xl border border-line bg-panel py-1 shadow-2xl shadow-black/50">
          {items.map(({ id, label, icon: Icon, run, danger }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setOpen(false);
                run();
              }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] transition-colors hover:bg-hover ${
                danger ? "text-red-400 hover:text-red-300" : "text-gray-200 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}