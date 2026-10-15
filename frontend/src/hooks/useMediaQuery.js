import { useCallback, useSyncExternalStore } from "react";

// useMediaQuery("(max-width: 767px)") -> true or false, updates when the screen changes
export default function useMediaQuery(query) {
  const subscribe = useCallback(
    (callback) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}