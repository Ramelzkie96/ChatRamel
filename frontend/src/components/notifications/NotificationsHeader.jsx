import { Bell, CheckCheck, Trash2 } from "lucide-react";

export default function NotificationsHeader({ unread, total, onMarkAll, onClear }) {
  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-hover text-blue-400">
          <Bell size={22} />
        </span>
        <h2 className="text-xl font-semibold">Notifications</h2>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onMarkAll}
          disabled={unread === 0}
          aria-label="Mark all as read"
          title="Mark all as read"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-hover hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <CheckCheck size={20} />
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={total === 0}
          aria-label="Clear all notifications"
          title="Clear all"
          className="rounded-lg p-2 text-muted transition-colors hover:bg-hover hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}