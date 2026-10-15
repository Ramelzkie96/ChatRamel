import { useEffect, useMemo, useState } from "react";
import NotificationsHeader from "./NotificationsHeader";
import NotificationFilters from "./NotificationFilters";
import NotificationList from "./NotificationList";
import ConfirmModal from "../modals/ConfirmModal";
import useNotifications from "../../hooks/useNotifications";
import useNotificationActions from "../../hooks/useNotificationActions";

const FILTERS = {
  all: () => true,
  unread: (n) => !n.readAt,
  calls: (n) => n.type === "missed_call",
  groups: (n) => n.type.startsWith("group_"),
};

const EMPTY_TEXT = {
  all: "You're all caught up. Missed calls and group updates show up here.",
  unread: "No unread notifications.",
  calls: "No missed calls.",
  groups: "No group updates.",
};

export default function NotificationsPanel() {
  const { items, unread, loading, loadingMore, hasMore, loadMore, setPanelOpen } =
    useNotifications();
  const actions = useNotificationActions();
  const [filter, setFilter] = useState("all");
  const [clearing, setClearing] = useState(false);

  // while this panel is open, notifications that arrive are already "seen"
  useEffect(() => {
    setPanelOpen(true);
    return () => setPanelOpen(false);
  }, [setPanelOpen]);

  const shown = useMemo(() => items.filter(FILTERS[filter]), [items, filter]);

  return (
    <section className="flex h-screen w-[360px] shrink-0 flex-col border-r border-line bg-panel">
      <NotificationsHeader
        unread={unread}
        total={items.length}
        onMarkAll={actions.markAllRead}
        onClear={() => setClearing(true)}
      />
      <NotificationFilters value={filter} onChange={setFilter} unread={unread} />

      <div className="thin-scroll flex-1 overflow-y-auto px-2 pb-4">
        {loading && <p className="px-3 py-4 text-sm text-muted">Loading notifications...</p>}

        {!loading && shown.length === 0 && (
          <p className="px-3 py-4 text-sm text-muted">{EMPTY_TEXT[filter]}</p>
        )}

        {!loading && (
          <NotificationList
            items={shown}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
            onOpen={actions.open}
            onDelete={actions.remove}
          />
        )}
      </div>

      {clearing && (
        <ConfirmModal
          danger
          title="Clear all notifications?"
          message="Every notification will be deleted. This can't be undone."
          confirmLabel="Clear all"
          onConfirm={actions.clearAll}
          onClose={() => setClearing(false)}
        />
      )}
    </section>
  );
}