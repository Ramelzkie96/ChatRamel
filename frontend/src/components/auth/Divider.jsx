export default function Divider({ label }) {
  return (
    <div className="flex items-center gap-4 py-1">
      <span className="h-px flex-1 bg-line" />
      <span className="text-sm text-muted">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}