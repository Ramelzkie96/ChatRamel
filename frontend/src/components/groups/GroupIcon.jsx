import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { getCategory } from "../../utils/groupCategories";

// the group's photo when it has one, otherwise a colored circle with its category icon
export default function GroupIcon({ src, category, name = "Group", size = 44 }) {
  const [broken, setBroken] = useState(false);

  useEffect(() => setBroken(false), [src]);

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setBroken(true)}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  const cat = getCategory(category);
  const Icon = cat?.icon ?? Users;

  return (
    <div
      aria-label={name}
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full text-white ${
        cat?.circle ?? "bg-accent"
      }`}
    >
      <Icon size={Math.round(size * 0.48)} />
    </div>
  );
}