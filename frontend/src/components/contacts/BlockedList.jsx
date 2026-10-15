import { useState } from "react";
import { Loader2 } from "lucide-react";
import Avatar from "../ui/Avatar";

function BlockedRow({ person, onUnblock }) {
  const [loading, setLoading] = useState(false);

  const unblock = async () => {
    setLoading(true);
    await onUnblock(person);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5">
      <Avatar name={person.name} src={person.avatar} size={46} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{person.name}</p>
        <p className="truncate text-sm text-muted">{person.email}</p>
      </div>

      <button
        type="button"
        onClick={unblock}
        disabled={loading}
        className="flex min-w-[84px] shrink-0 items-center justify-center rounded-xl border border-line px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-hover hover:text-white disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Unblock"}
      </button>
    </div>
  );
}

export default function BlockedList({ people, onUnblock }) {
  return (
    <div className="flex flex-col gap-0.5">
      {people.map((p) => (
        <BlockedRow key={p._id} person={p} onUnblock={onUnblock} />
      ))}
    </div>
  );
}