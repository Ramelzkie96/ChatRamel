import ContactListItem from "./ContactListItem";

const letterOf = (name = "") => {
  const first = name
    .trim()
    .charAt(0)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
};

function Heading({ children }) {
  return (
    <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">
      {children}
    </p>
  );
}

export default function ContactList({ items, pinFavorites, activeUserId, actions, onOpen }) {
  const sorted = [...items].sort((a, b) => a.user.name.localeCompare(b.user.name));

  const pinned = pinFavorites ? sorted.filter((i) => i.favorite) : [];
  const rest = pinFavorites ? sorted.filter((i) => !i.favorite) : sorted;

  // A, B, C... with "#" (numbers and symbols) last
  const byLetter = new Map();
  rest.forEach((item) => {
    const letter = letterOf(item.user.name);
    byLetter.set(letter, [...(byLetter.get(letter) ?? []), item]);
  });
  const letters = [...byLetter.keys()].sort((a, b) =>
    a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)
  );

  const row = (item) => (
    <ContactListItem
      key={item.user._id}
      item={item}
      active={activeUserId === item.user._id}
      actions={actions}
      onOpen={onOpen}
    />
  );

  return (
    <div>
      {pinned.length > 0 && (
        <>
          <Heading>Favorites</Heading>
          <div className="flex flex-col gap-0.5">{pinned.map(row)}</div>
        </>
      )}

      {letters.map((letter) => (
        <div key={letter}>
          <Heading>{letter}</Heading>
          <div className="flex flex-col gap-0.5">{byLetter.get(letter).map(row)}</div>
        </div>
      ))}
    </div>
  );
}