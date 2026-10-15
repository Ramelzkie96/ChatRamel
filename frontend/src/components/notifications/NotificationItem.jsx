import { X } from "lucide-react";
import NotificationIcon from "./NotificationIcon";
import { formatLastSeen } from "../../utils/chatHelpers";

export default function NotificationItem({ n, onOpen, onDelete }) {
  const unread = !n.readAt;

  return (
    // a div, because a button can't be nested inside a button
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(n)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return; // ignore keys pressed on the delete button
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(n);
        }
      }}
      className={`group flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-hover ${
        unread ? "bg-accent/10" : ""
      }`}
    >
      <NotificationIcon type={n.type} role={n.meta?.role} />

      <div className="min-w-0 flex-1">
        <p className={`text-[15px] leading-snug ${unread ? "font-semibold" : "text-gray-300"}`}>
          {n.text}
        </p>
        <p className="mt-0.5 text-xs text-muted">{formatLastSeen(n.createdAt)}</p>
      </div>

      {unread && <span aria-label="Unread" className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />}

      <button
        type="button"
        aria-label="Delete notification"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(n._id);
        }}
        className="shrink-0 rounded-lg p-1.5 text-muted opacity-0 transition-colors hover:bg-hover hover:text-red-400 focus:opacity-100 group-hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}