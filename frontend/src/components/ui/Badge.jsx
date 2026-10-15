export default function Badge({ count, className = "" }) {
  if (!count) return null;

  return (
    <span
      className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-white ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}