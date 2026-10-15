export default function SettingsNavItem({ icon: Icon, title, description, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors ${
        active ? "bg-accent/30 ring-1 ring-accent/40" : "hover:bg-hover"
      }`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-hover text-blue-300">
        <Icon size={22} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{title}</span>
        <span className="block truncate text-sm text-muted">{description}</span>
      </span>
    </button>
  );
}