import { Clock } from "lucide-react";

export default function LastSeen({ value }) {
  return (
    <div className="flex items-center gap-3 border-t border-line px-6 py-5">
      <Clock size={20} strokeWidth={1.8} className="text-muted" />
      <div>
        <p className="text-sm text-gray-200">Last seen</p>
        <p className="text-xs text-muted">{value}</p>
      </div>
    </div>
  );
}