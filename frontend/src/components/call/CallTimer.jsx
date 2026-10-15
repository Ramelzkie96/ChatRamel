import { useEffect, useState } from "react";
import { formatDuration } from "../../utils/formatDuration";

export default function CallTimer({ since }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums">
      {formatDuration(since ? Math.max(0, (now - since) / 1000) : 0)}
    </span>
  );
}