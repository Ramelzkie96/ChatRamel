export default function ContactFilters({ value, onChange, counts }) {
  const tabs = [
    { id: "all", label: `All (${counts.all})` },
    { id: "online", label: `Online (${counts.online})` },
    { id: "favorites", label: "Favorites" },
    { id: "blocked", label: "Blocked" },
  ];

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          aria-pressed={value === t.id}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
            value === t.id ? "bg-accent text-white" : "bg-hover text-gray-300 hover:text-white"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}