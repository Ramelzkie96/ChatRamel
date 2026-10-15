import { useEffect, useState } from "react";
import { assetUrl } from "../../utils/api";

const COLORS = [
  "from-blue-500 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-purple-500 to-fuchsia-600",
  "from-cyan-500 to-sky-600",
];

const STATUS_COLORS = {
  online: "bg-green-500",
  busy: "bg-amber-400",
  offline: "bg-gray-500",
};

const getInitials = (name = "") =>
  name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const getColor = (name = "") => {
  let hash = 0;
  for (const ch of name) hash = (hash + ch.charCodeAt(0)) % COLORS.length;
  return COLORS[hash];
};

export default function Avatar({ name, src, status, size = 40 }) {
  const [broken, setBroken] = useState(false);

  // a new photo gets a fresh chance to load
  useEffect(() => setBroken(false), [src]);

  const url = src && !broken ? assetUrl(src) : "";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {url ? (
        <img
          src={url}
          alt={name}
          onError={() => setBroken(true)}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ${getColor(name)}`}
          style={{ fontSize: size * 0.36 }}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-panel ${STATUS_COLORS[status] || STATUS_COLORS.offline}`}
        />
      )}
    </div>
  );
}