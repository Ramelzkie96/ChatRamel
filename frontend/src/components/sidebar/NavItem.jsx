import Badge from "../ui/Badge";

export default function NavItem({ icon: Icon, label, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] transition-colors ${
        active
          ? "bg-accent/25 text-white ring-1 ring-accent/40"
          : "text-gray-300 hover:bg-hover"
      }`}
    >
      <Icon size={20} strokeWidth={1.8} />
      <span className="flex-1">{label}</span>
      <Badge count={badge} />
    </button>
  );
}