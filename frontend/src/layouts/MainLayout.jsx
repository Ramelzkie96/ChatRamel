import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import GroupsPanel from "../components/groups/GroupsPanel";
import ContactsPanel from "../components/contacts/ContactsPanel";
import NotificationsPanel from "../components/notifications/NotificationsPanel";
import SettingsView from "../components/settings/SettingsView";
import ChatWindow from "../components/chat/ChatWindow";
import InfoPanel from "../components/info/InfoPanel";
import Drawer from "../components/ui/Drawer";
import MobileBackBar from "../components/ui/MobileBackBar";
import useMediaQuery from "../hooks/useMediaQuery";
import useChat from "../hooks/useChat";

const PAGES = {
  groups: GroupsPanel,
  contacts: ContactsPanel,
  notifications: NotificationsPanel,
};

export default function MainLayout() {
  const isMobile = useMediaQuery("(max-width: 767px)"); // sidebar becomes a drawer
  const isCompact = useMediaQuery("(max-width: 1023px)"); // info panel becomes a drawer
  const { selectTick } = useChat();

  const [activeNav, setActiveNav] = useState("chats");
  const [showInfo, setShowInfo] = useState(true); // desktop: the inline info column
  const [infoOpen, setInfoOpen] = useState(false); // tablet and phone: the info drawer
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth < 768); // phones start on the chat list

  // every time a chat is picked (sidebar, Groups, Contacts, notifications, member menu...)
  useEffect(() => {
    if (!selectTick) return;
    setInfoOpen(false);
    if (isCompact) setActiveNav((prev) => (prev in PAGES ? "chats" : prev));
    if (isMobile) setSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectTick]);

  const changeNav = (id) => {
    setActiveNav(id);
    if (isMobile) {
      setSidebarOpen(id === "chats"); // "Chats" keeps the list open, anything else shows its page
    } else if (!isCompact && id in PAGES && window.innerWidth < 1536) {
      setShowInfo(false); // desktop only: four columns don't fit on medium screens
    }
  };

  const backToChats = () => {
    setActiveNav("chats");
    if (isMobile) setSidebarOpen(true);
  };

  const toggleInfo = () => (isCompact ? setInfoOpen((v) => !v) : setShowInfo((v) => !v));

  const Page = PAGES[activeNav];

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-app text-white">
      <Sidebar
        activeNav={activeNav}
        onNavChange={changeNav}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {activeNav === "settings" ? (
        // Settings replaces the chat window and the info panel
        <SettingsView onExit={backToChats} />
      ) : (
        <>
          {/* phones: full screen page. tablets: beside the sidebar. desktop: a normal column */}
          {Page && (
            <div className="fixed inset-0 z-30 flex flex-col bg-panel md:left-[340px] lg:contents">
              <MobileBackBar label="Back to chats" onBack={backToChats} className="md:hidden" />
              <Page />
            </div>
          )}

          <ChatWindow onToggleInfo={toggleInfo} onOpenMenu={() => setSidebarOpen(true)} />

          {isCompact ? (
            <Drawer
              open={infoOpen}
              side="right"
              label="Chat info"
              onClose={() => setInfoOpen(false)}
            >
              <InfoPanel embedded />
            </Drawer>
          ) : (
            showInfo && <InfoPanel />
          )}
        </>
      )}
    </div>
  );
}