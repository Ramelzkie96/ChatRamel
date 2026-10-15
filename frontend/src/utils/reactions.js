export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

// the dark colors for emoji-picker-react
export const PICKER_THEME = {
  "--epr-bg-color": "#0b1226",
  "--epr-category-label-bg-color": "#0b1226",
  "--epr-picker-border-color": "#1a2340",
  "--epr-search-border-color": "#1a2340",
  "--epr-search-input-bg-color": "#0a1226",
  "--epr-hover-bg-color": "#121b34",
  "--epr-focus-bg-color": "#121b34",
  "--epr-text-color": "#d1d5db",
  "--epr-highlight-color": "#2563eb",
};

// [{ user, emoji }] -> [{ emoji, count, mine, users }], most used first
export function groupReactions(reactions = [], myId) {
  const map = new Map();

  reactions.forEach((r) => {
    const group = map.get(r.emoji) ?? { emoji: r.emoji, count: 0, mine: false, users: [] };
    group.count += 1;
    group.users.push(r.user);
    if (r.user?._id === myId) group.mine = true;
    map.set(r.emoji, group);
  });

  return [...map.values()].sort((a, b) => b.count - a.count);
}