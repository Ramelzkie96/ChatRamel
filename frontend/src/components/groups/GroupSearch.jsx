import { Search, X } from "lucide-react";

export default function GroupSearch({ value, onChange }) {
  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-[#0a1226] px-4 py-3 focus-within:border-accent">
        <Search size={18} className="shrink-0 text-muted" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search groups..."
          className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-muted"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="shrink-0 text-muted transition-colors hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}