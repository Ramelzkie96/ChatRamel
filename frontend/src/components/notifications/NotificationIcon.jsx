import { Bell, PhoneMissed, UserPlus, UserMinus, ShieldCheck, ShieldOff } from "lucide-react";

const STYLES = {
  missed_call: { icon: PhoneMissed, color: "bg-red-500/15 text-red-400" },
  group_added: { icon: UserPlus, color: "bg-green-500/15 text-green-400" },
  group_removed: { icon: UserMinus, color: "bg-red-500/15 text-red-400" },
  group_role: { icon: ShieldCheck, color: "bg-blue-500/15 text-blue-400" },
};

export default function NotificationIcon({ type, role, size = 46 }) {
  const style = STYLES[type] ?? { icon: Bell, color: "bg-hover text-gray-300" };
  const Icon = type === "group_role" && role === "member" ? ShieldOff : style.icon;

  return (
    <span
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full ${style.color}`}
    >
      <Icon size={Math.round(size * 0.46)} />
    </span>
  );
}