import toast from "react-hot-toast";
import useChat from "./useChat";
import useNotifications from "./useNotifications";

// Clicking a notification: mark it read, then jump to the related chat if you're still in it.
export default function useNotificationActions() {
  const { chats, selectChat } = useChat();
  const { markRead, markAllRead, remove, clearAll } = useNotifications();

  const open = (n) => {
    if (!n.readAt) markRead([n._id]);
    if (!n.chat) return;

    const stillIn = chats.some((c) => c._id === n.chat);
    if (n.type === "group_removed" || !stillIn) {
      toast("You're no longer in that group.");
      return;
    }

    selectChat(n.chat);
  };

  return { open, markAllRead, remove, clearAll };
}