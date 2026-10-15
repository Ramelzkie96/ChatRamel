import { groupReactions } from "../../utils/reactions";

// onToggle(emoji): tap the emoji to add or remove my reaction (omit it to make the chips read-only)
// onShowDetails(emoji): tap the number to see who reacted
export default function ReactionBar({ reactions = [], myId, isMine, onToggle, onShowDetails }) {
  const groups = groupReactions(reactions, myId);
  if (groups.length === 0) return null;

  return (
    <div className={`mt-1 flex flex-wrap gap-1 ${isMine ? "justify-end" : "justify-start"}`}>
      {groups.map((g) => (
        <span
          key={g.emoji}
          className={`inline-flex items-center overflow-hidden rounded-full border text-sm ${
            g.mine ? "border-accent bg-accent/20" : "border-line bg-hover"
          }`}
        >
          <button
            type="button"
            disabled={!onToggle}
            onClick={() => onToggle(g.emoji)}
            aria-label={`${g.mine ? "Remove" : "Add"} ${g.emoji} reaction`}
            aria-pressed={g.mine}
            className="py-0.5 pl-2 pr-1 transition-colors hover:bg-white/10 disabled:cursor-default disabled:hover:bg-transparent"
          >
            {g.emoji}
          </button>
          <button
            type="button"
            onClick={() => onShowDetails(g.emoji)}
            aria-label={`See who reacted with ${g.emoji}`}
            className="py-0.5 pl-0.5 pr-2 text-xs font-medium text-gray-200 transition-colors hover:bg-white/10"
          >
            {g.count}
          </button>
        </span>
      ))}
    </div>
  );
}