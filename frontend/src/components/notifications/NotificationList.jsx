import { Loader2 } from "lucide-react";
import NotificationItem from "./NotificationItem";

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const bucketOf = (date) => {
  const diff = Math.round((startOfDay(new Date()) - startOfDay(new Date(date))) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return "Earlier";
};

export default function NotificationList({
  items,
  hasMore,
  loadingMore,
  onLoadMore,
  onOpen,
  onDelete,
}) {
  // items arrive newest first, so the groups come out as Today, Yesterday, Earlier
  const groups = [];
  items.forEach((n) => {
    const label = bucketOf(n.createdAt);
    const last = groups.at(-1);
    if (last?.label === label) last.items.push(n);
    else groups.push({ label, items: [n] });
  });

  return (
    <div>
      {groups.map((g) => (
        <section key={g.label}>
          <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">
            {g.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {g.items.map((n) => (
              <NotificationItem key={n._id} n={n} onOpen={onOpen} onDelete={onDelete} />
            ))}
          </div>
        </section>
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="mx-3 mt-4 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-xl border border-line py-2.5 text-[15px] text-gray-200 transition-colors hover:bg-hover disabled:opacity-60"
        >
          {loadingMore ? <Loader2 size={18} className="animate-spin" /> : "Load more"}
        </button>
      )}
    </div>
  );
}