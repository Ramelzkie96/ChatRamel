import { useEffect, useState } from "react";
import { Search, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../ui/Avatar";
import useDebounce from "../../hooks/useDebounce";
import { api } from "../../utils/api";

export default function UserSearch({
  onPick,
  selectedIds = [],
  disabledIds = [],
  disabledLabel = "In group",
  busyId = null,
}) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(term.trim());

  useEffect(() => {
    if (debounced.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .get(`/users?search=${encodeURIComponent(debounced)}`)
      .then((data) => !cancelled && setResults(data))
      .catch((err) => !cancelled && toast.error(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div>
      <div className="flex items-center gap-3 rounded-xl border border-line bg-[#0a1226] px-4 py-3 focus-within:border-accent">
        <Search size={18} className="shrink-0 text-muted" />
        <input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-muted"
        />
        {loading && <Loader2 size={18} className="animate-spin text-muted" />}
      </div>

      <div className="mt-3 flex max-h-64 flex-col gap-1 overflow-y-auto">
        {debounced.length < 2 && (
          <p className="py-4 text-center text-sm text-muted">Type at least 2 letters to search.</p>
        )}

        {debounced.length >= 2 && !loading && results.length === 0 && (
          <p className="py-4 text-center text-sm text-muted">No users found.</p>
        )}

        {results.map((u) => {
          const selected = selectedIds.includes(u._id);
          const alreadyIn = disabledIds.includes(u._id);

          return (
            <button
              key={u._id}
              type="button"
              disabled={busyId === u._id || alreadyIn}
              onClick={() => onPick(u)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <Avatar name={u.name} src={u.avatar} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted">{u.email}</p>
              </div>
              {alreadyIn && <span className="text-xs text-muted">{disabledLabel}</span>}
              {selected && <Check size={18} className="text-blue-400" />}
              {busyId === u._id && <Loader2 size={18} className="animate-spin text-muted" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}