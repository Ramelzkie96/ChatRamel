import { ArrowLeft } from "lucide-react";

export default function MobileBackBar({ label, onBack, className = "" }) {
  return (
    <div
      className={`flex shrink-0 items-center border-b border-line bg-panel px-2 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] ${className}`}
    >
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] text-gray-200 transition-colors hover:bg-hover hover:text-white"
      >
        <ArrowLeft size={20} />
        {label}
      </button>
    </div>
  );
}