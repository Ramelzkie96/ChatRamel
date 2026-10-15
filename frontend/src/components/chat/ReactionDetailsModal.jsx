import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
import { groupReactions } from "../../utils/reactions";

export default function ReactionDetailsModal({ reactions = [], myId, initialTab = "all", onClose }) {
  const [tab, setTab] = useState(initialTab);
  const groups = groupReactions(reactions, myId);

  // the last reaction was removed while this was open
  useEffect(() => {
    if (reactions.length === 0) onClose();
  }, [reactions.length, onClose]);

  // the emoji I was looking at disappeared, so show everyone again
  const activeTab = tab === "all" || groups.some((g) => g.emoji === tab) ? tab : "all";
  const rows = reactions.filter((r) => activeTab === "all" || r.emoji === activeTab);

  const tabClass = (active) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      active ? "bg-accent text-white" : "bg-hover text-gray-300 hover:text-white"
    }`;

  return (
    <Modal title="Reactions" onClose={onClose}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab("all")} className={tabClass(activeTab === "all")}>
          All {reactions.length}
        </button>
        {groups.map((g) => (
          <button
            key={g.emoji}
            type="button"
            onClick={() => setTab(g.emoji)}
            className={tabClass(activeTab === g.emoji)}
          >
            {g.emoji} {g.count}
          </button>
        ))}
      </div>

      <div className="thin-scroll flex max-h-72 flex-col gap-1 overflow-y-auto">
        {rows.map((r, i) => (
          <div key={`${r.user?._id ?? "unknown"}-${i}`} className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar name={r.user?.name} src={r.user?.avatar} size={40} />
            <p className="min-w-0 flex-1 truncate text-[15px] font-medium">
              {r.user?._id === myId ? "You" : r.user?.name ?? "Unknown"}
            </p>
            <span className="text-xl">{r.emoji}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}