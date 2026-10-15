import { useEffect, useRef } from "react";

export default function useAutoScroll(dependency) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dependency]);

  return bottomRef;
}