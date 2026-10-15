import { useMemo, useState } from "react";

const KEY = "chatramel_contact_filter";
const VALID = ["all", "online", "favorites", "blocked"];

const readFilter = () => {
  try {
    const saved = localStorage.getItem(KEY);
    return VALID.includes(saved) ? saved : "all";
  } catch {
    return "all";
  }
};

// items: contacts with live presence ({ user, favorite, blockedByMe, status, lastSeen })
// blocked: the people I blocked. The filter choice is remembered in this browser.
export default function useContactFilter(items, blocked) {
  const [search, setSearch] = useState("");
  const [filter, setFilterState] = useState(readFilter);

  const setFilter = (next) => {
    setFilterState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // storage blocked: the filter still works until the page reloads
    }
  };

  return useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = (u) =>
      !term ||
      u.name.toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term);

    // people I blocked only show in the Blocked tab
    const visible = items.filter((i) => !i.blockedByMe);

    const counts = {
      all: visible.length,
      online: visible.filter((i) => i.status === "online").length,
      favorites: visible.filter((i) => i.favorite).length,
      blocked: blocked.length,
    };

    const filtered = visible.filter(
      (i) =>
        matches(i.user) &&
        (filter === "all" ||
          (filter === "online" && i.status === "online") ||
          (filter === "favorites" && i.favorite))
    );

    return {
      search,
      setSearch,
      filter,
      setFilter,
      filtered,
      filteredBlocked: blocked.filter(matches),
      counts,
    };
    // setFilter only touches state and storage, so it's fine to leave out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, blocked, search, filter]);
}