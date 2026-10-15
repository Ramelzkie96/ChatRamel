import { useMemo, useState } from "react";
import { CATEGORIES } from "../utils/groupCategories";

const KEY = "chatramel_group_filter";
const VALID = ["all", ...CATEGORIES.map((c) => c.id)];

const readFilter = () => {
  try {
    const saved = localStorage.getItem(KEY);
    return VALID.includes(saved) ? saved : "all";
  } catch {
    return "all";
  }
};

// search text + category filter. The category choice is remembered in this browser.
export default function useGroupFilter(groups) {
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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return groups.filter(
      (g) =>
        (filter === "all" || g.category === filter) &&
        (!term || g.name.toLowerCase().includes(term))
    );
  }, [groups, search, filter]);

  return { search, setSearch, filter, setFilter, filtered, total: groups.length };
}