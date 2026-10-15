import { useState } from "react";
import { Bell, Image, Link2, Users, LogOut } from "lucide-react";
import SectionTitle from "../../ui/SectionTitle";
import ToggleSwitch from "../../ui/ToggleSwitch";

export default function GroupSettings({ onOpenMedia, onManageMembers, onLeave }) {
  const [notifications, setNotifications] = useState(true);

  const rows = [
    { id: "media", label: "Media & Files", icon: Image, onClick: onOpenMedia },
    { id: "links", label: "Shared Links", icon: Link2 },
    { id: "manage", label: "Manage Members", icon: Users, onClick: onManageMembers },
  ];

  return (
    <>
      <section className="mt-3 border-t border-line px-5 pt-5">
        <SectionTitle>Group Settings</SectionTitle>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 py-2.5 text-[15px] text-gray-200">
            <Bell size={20} strokeWidth={1.8} className="shrink-0" />
            <span className="flex-1">Notifications</span>
            <ToggleSwitch checked={notifications} onChange={setNotifications} />
          </div>

          {rows.map(({ id, label, icon: Icon, onClick }) => (
            <button
              key={id}
              type="button"
              onClick={onClick}
              className="flex w-full items-center gap-3 py-2.5 text-left text-[15px] text-gray-200 transition-colors hover:text-white"
            >
              <Icon size={20} strokeWidth={1.8} className="shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-3 border-t border-line px-5 py-4">
        <button
          type="button"
          onClick={onLeave}
          className="flex items-center gap-3 py-2 text-[15px] text-red-500 transition-colors hover:text-red-400"
        >
          <LogOut size={20} strokeWidth={1.8} />
          Leave Group
        </button>
      </div>
    </>
  );
}