import { useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import GroupsPanel from "../components/groups/GroupsPanel";
import ContactsPanel from "../components/contacts/ContactsPanel";
import NotificationsPanel from "../components/notifications/NotificationsPanel";
import SettingsView from "../components/settings/SettingsView";
import ChatWindow from "../components/chat/ChatWindow";
import InfoPanel from "../components/info/InfoPanel";

const EXTRA_COLUMNS = ["groups", "contacts", "notifications"];

export default function MainLayout() {
  const [activeNav, setActiveNav] = useState("chats");
  const [showInfo, setShowInfo] = useState(true);

  const changeNav = (id) => {
    setActiveNav(id);
    // four columns don't fit on smaller screens, so give the chat the room
    if (EXTRA_COLUMNS.includes(id) && window.innerWidth < 1536) setShowInfo(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-app text-white">
      <Sidebar activeNav={activeNav} onNavChange={changeNav} />

      {activeNav === "settings" ? (
        // Settings replaces the chat window and the info panel
        <SettingsView />
      ) : (
        <>
          {activeNav === "groups" && <GroupsPanel />}
          {activeNav === "contacts" && <ContactsPanel />}
          {activeNav === "notifications" && <NotificationsPanel />}
          <ChatWindow onToggleInfo={() => setShowInfo((v) => !v)} />
          {showInfo && <InfoPanel />}
        </>
      )}
    </div>
  );
}