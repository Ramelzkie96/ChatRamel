import { User } from "lucide-react";
import SettingsNavItem from "./SettingsNavItem";

const SECTIONS = [
  { id: "account", title: "Account", description: "Profile, username, and email", icon: User },
];

export default function SettingsPanel({ active, onSelect }) {
  return (
    <section className="flex h-screen w-[380px] shrink-0 flex-col border-r border-line bg-panel">
      <div className="px-6 pb-4 pt-7">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="mt-1 text-sm text-muted">Manage your account and profile.</p>
      </div>

      <div className="thin-scroll flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
        {SECTIONS.map((s) => (
          <SettingsNavItem
            key={s.id}
            icon={s.icon}
            title={s.title}
            description={s.description}
            active={active === s.id}
            onClick={() => onSelect(s.id)}
          />
        ))}
      </div>
    </section>
  );
}