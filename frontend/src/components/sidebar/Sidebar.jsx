import { useEffect } from "react";
import SidebarHeader from "./SidebarHeader";
import SidebarNav from "./SidebarNav";
import DirectMessages from "./DirectMessages";
import GroupChats from "./GroupChats";
import AlertSettings from "./AlertSettings";
import UserFooter from "./UserFooter";

export default function Sidebar({ activeNav, onNavChange, open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (document.querySelector("[data-modal]")) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* dark backdrop, phones only */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[85vw] max-w-[340px] flex-col border-r border-line bg-panel pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] transition-[transform,visibility] duration-300 md:static md:z-auto md:h-dvh md:w-[340px] md:max-w-none md:shrink-0 md:p-0 md:transition-none ${
          open ? "" : "max-md:invisible max-md:-translate-x-full"
        }`}
      >
        <SidebarHeader onClose={onClose} />
        <SidebarNav activeNav={activeNav} onNavChange={onNavChange} />

        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto border-t border-line">
          <DirectMessages />
          {/* while the Groups column is open, the groups are listed there instead */}
          <GroupChats collapsed={activeNav === "groups"} />
        </div>

        <AlertSettings />
        <UserFooter />
      </aside>
    </>
  );
}