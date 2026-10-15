import SidebarHeader from "./SidebarHeader";
import SidebarNav from "./SidebarNav";
import DirectMessages from "./DirectMessages";
import GroupChats from "./GroupChats";
import AlertSettings from "./AlertSettings";
import UserFooter from "./UserFooter";

export default function Sidebar({ activeNav, onNavChange }) {
  return (
    <aside className="flex h-screen w-[340px] shrink-0 flex-col border-r border-line bg-panel">
      <SidebarHeader />
      <SidebarNav activeNav={activeNav} onNavChange={onNavChange} />

      <div className="thin-scroll flex-1 overflow-y-auto border-t border-line">
        <DirectMessages />
        {/* while the Groups column is open, the groups are listed there instead */}
        <GroupChats collapsed={activeNav === "groups"} />
      </div>

      <AlertSettings />
      <UserFooter />
    </aside>
  );
}