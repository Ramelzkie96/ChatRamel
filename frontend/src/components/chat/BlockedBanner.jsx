import { useState } from "react";
import { Ban, Loader2 } from "lucide-react";

// replaces the message input while you have this person blocked
export default function BlockedBanner({ name, onUnblock }) {
  const [loading, setLoading] = useState(false);

  const unblock = async () => {
    setLoading(true);
    await onUnblock();
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3 border-t border-line px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
      <p className="flex min-w-0 items-center gap-3 text-[15px] text-gray-300">
        <Ban size={20} className="shrink-0 text-muted" />
        <span className="sm:truncate">
          You blocked {name}. Unblock to send messages.
        </span>
      </p>

      <button
        type="button"
        onClick={unblock}
        disabled={loading}
        className="flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : "Unblock"}
      </button>
    </div>
  );
}