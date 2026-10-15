import { MessageCircle, Users, UsersRound, Bell, Settings } from "lucide-react";
import NavItem from "./NavItem";
import { navItems } from "../../data/mockData";
import useChat from "../../hooks/useChat";
import useContacts from "../../hooks/useContacts";
import useNotifications from "../../hooks/useNotifications";
import usePresence from "../../hooks/usePresence";

const ICONS = { MessageCircle, Users, UsersRound, Bell, Settings };

export default function SidebarNav({ activeNav, onNavChange }) {
  const { items } = useChat();
  const { contacts } = useContacts();
  const { unread: unreadNotifications } = useNotifications();
  const { onlineIds } = usePresence();

  const totalUnread = items.reduce((sum, c) => sum + (c.unread || 0), 0);
  const groupsWithUnread = items.filter((c) => c.isGroup && c.unread > 0).length;
  const contactsOnline = contacts.filter(
    (c) => !c.blockedByMe && onlineIds.has(c.user._id)
  ).length;

  const badgeFor = (item) => {
    if (item.id === "chats") return totalUnread;
    if (item.id === "groups") return groupsWithUnread;
    if (item.id === "contacts") return contactsOnline;
    if (item.id === "notifications") return unreadNotifications;
    return item.badge;
  };

  return (
    <nav className="flex flex-col gap-1 px-3 pb-4">
      {navItems.map((item) => (
        <NavItem
          key={item.id}
          icon={ICONS[item.icon]}
          label={item.label}
          badge={badgeFor(item)}
          active={activeNav === item.id}
          onClick={() => onNavChange(item.id)}
        />
      ))}
    </nav>
  );
}