import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../utils/api";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import usePresence from "../hooks/usePresence";
import { useTypingTracker } from "../hooks/useTyping";
import { toListItem } from "../utils/chatHelpers";
import { alertNewMessage } from "../utils/messageAlert";

export const ChatContext = createContext(null);

const isVisible = () => document.visibilityState === "visible";

// the small version of a message the sidebar keeps as "lastMessage"
const toLastMessage = (message) => ({
  _id: message._id,
  text: message.text,
  type: message.type,
  image: message.image,
  file: message.file,
  createdAt: message.createdAt,
  seenBy: message.seenBy,
  sender: { _id: message.sender._id, name: message.sender.name },
});

export function ChatProvider({ children }) {
  const { user, updateUser } = useAuth();
  const socket = useSocket();
  const { onlineIds, lastSeen } = usePresence();
  const typingByChat = useTypingTracker();
  const userId = user?._id;

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);

  // set when a chat is cleared; message and media lists watch it and empty themselves
  const [clearSignal, setClearSignal] = useState(null);

  // socket handlers read the latest values through refs, so they don't re-subscribe constantly
  const activeRef = useRef(null);
  const chatsRef = useRef([]);
  const leavingRef = useRef(new Set()); // chats I chose to leave (no "removed" toast for those)
  useEffect(() => {
    activeRef.current = activeChatId;
  }, [activeChatId]);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  const loadChats = useCallback(async (silent = false) => {
    try {
      const data = await api.get("/chats");
      setChats(data);
      setActiveChatId((prev) => prev ?? data[0]?._id ?? null); // open the newest chat first
    } catch (err) {
      if (!silent) toast.error(err.message);
    } finally {
      if (!silent) setLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    if (userId) loadChats();
  }, [userId, loadChats]);

  // replace a chat's data in place (rename, cover, members) and keep its unread count
  const patchChat = useCallback((chat) => {
    setChats((prev) =>
      prev.some((c) => c._id === chat._id)
        ? prev.map((c) => (c._id === chat._id ? { ...chat, unread: c.unread } : c))
        : prev
    );
  }, []);

  // remove a chat from my list, and open another one if it was the active chat
  const removeChat = useCallback((chatId) => {
    setChats((prev) => prev.filter((c) => c._id !== chatId));
    setActiveChatId((prev) =>
      prev === chatId ? chatsRef.current.find((c) => c._id !== chatId)?._id ?? null : prev
    );
  }, []);

  // call before leaving a group; returns a function that undoes the mark if the request fails
  const markLeaving = useCallback((chatId) => {
    leavingRef.current.add(chatId);
    return () => leavingRef.current.delete(chatId);
  }, []);

  // I blocked / unblocked this person: update the direct chat I have with them
  const setBlocked = useCallback((otherId, blocked) => {
    setChats((prev) =>
      prev.map((c) =>
        !c.isGroup && c.members.some((m) => m._id === otherId) ? { ...c, blockedByMe: blocked } : c
      )
    );
  }, []);

    // someone changed their name, photo or bio
  const patchUser = useCallback((u) => {
    setChats((prev) =>
      prev.map((c) =>
        c.members.some((m) => m._id === u.userId)
          ? {
              ...c,
              members: c.members.map((m) =>
                m._id === u.userId ? { ...m, name: u.name, avatar: u.avatar, bio: u.bio } : m
              ),
            }
          : c
      )
    );
  }, []);

  // I cleared this chat: empty its preview and badge, and tell the open lists to empty themselves
  const clearLocal = useCallback((chatId) => {
    setChats((prev) =>
      prev.map((c) => (c._id === chatId ? { ...c, lastMessage: null, unread: 0 } : c))
    );
    setClearSignal({ chatId, at: Date.now() });
  }, []);

  // tell the server I've read this chat, and clear its badge right away
  const markSeen = useCallback(
    (chatId) => {
      if (!socket || !chatId) return;
      socket.emit("message:seen", { chatId });
      setChats((prev) =>
        prev.some((c) => c._id === chatId && c.unread)
          ? prev.map((c) => (c._id === chatId ? { ...c, unread: 0 } : c))
          : prev
      );
    },
    [socket]
  );

  // opening a chat (or coming back to the tab) marks it as seen
  useEffect(() => {
    if (!activeChatId) return;

    const check = () => isVisible() && markSeen(activeChatId);
    check();

    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [activeChatId, markSeen]);

  // live events
  useEffect(() => {
    if (!socket || !userId) return;

    const onMessage = (message) => {
      const chatId = message.chat;

      // a chat we don't know yet: fetch the list again
      if (!chatsRef.current.some((c) => c._id === chatId)) {
        loadChats(true);
        return;
      }

      const mine = message.sender?._id === userId;
      const viewing = activeRef.current === chatId && isVisible();

            if (!mine && message.type !== "system") {
        alertNewMessage({
          message,
          chat: chatsRef.current.find((c) => c._id === chatId),
          viewing,
          onOpen: () => setActiveChatId(chatId),
        });
      }

      setChats((prev) => {
        const target = prev.find((c) => c._id === chatId);
        if (!target) return prev;

        const updated = {
          ...target,
          updatedAt: message.createdAt,
          unread: mine || viewing ? target.unread : (target.unread || 0) + 1,
          lastMessage: toLastMessage(message),
        };
        return [updated, ...prev.filter((c) => c._id !== chatId)];
      });

      // the chat is open and visible, so it counts as read immediately
      if (!mine && viewing) markSeen(chatId);
    };

        const onUserUpdated = (u) => {
      patchUser(u);
      // my own change, made in another tab: refresh the sidebar footer here too
      if (u.userId === userId) {
        updateUser({ name: u.name, username: u.username, avatar: u.avatar, bio: u.bio });
      }
    };

    const onNewChat = (chat) => {
      setChats((prev) =>
        prev.some((c) => c._id === chat._id) ? prev : [{ ...chat, unread: 0 }, ...prev]
      );
      if (chat.isGroup) toast.success(`You were added to ${chat.name}`);
    };

    // group renamed, new cover, members added or removed
    const onUpdated = (chat) => patchChat(chat);

    // I left, was removed, or the group was deleted
    const onRemoved = ({ chatId }) => {
      const existing = chatsRef.current.find((c) => c._id === chatId);
      const choseToLeave = leavingRef.current.delete(chatId); // true if I clicked Leave
      if (existing && !choseToLeave) {
        toast(`You're no longer in ${existing.isGroup ? existing.name : "this chat"}`);
      }
      removeChat(chatId);
    };

    // my own "seen" (from another tab) clears the badge here too
    const onSeen = ({ chatId, userId: seenBy }) => {
      if (seenBy !== userId) return;
      setChats((prev) =>
        prev.some((c) => c._id === chatId && c.unread)
          ? prev.map((c) => (c._id === chatId ? { ...c, unread: 0 } : c))
          : prev
      );
    };

    // I blocked / unblocked someone in another tab
    const onBlockUpdate = ({ userId: otherId, blocked }) => setBlocked(otherId, blocked);

    // I cleared a chat in another tab
    const onCleared = ({ chatId }) => clearLocal(chatId);

    // after a dropped connection, catch up on anything we missed
    const onReconnect = () => {
      loadChats(true);
      markSeen(activeRef.current);
    };

    socket.on("message:new", onMessage);
    socket.on("chat:new", onNewChat);
    socket.on("chat:updated", onUpdated);
    socket.on("chat:removed", onRemoved);
    socket.on("message:seen", onSeen);
    socket.on("block:update", onBlockUpdate);
    socket.on("chat:cleared", onCleared);
    socket.io.on("reconnect", onReconnect);
    socket.on("user:updated", onUserUpdated);

    return () => {
      socket.off("message:new", onMessage);
      socket.off("chat:new", onNewChat);
      socket.off("chat:updated", onUpdated);
      socket.off("chat:removed", onRemoved);
      socket.off("message:seen", onSeen);
      socket.off("block:update", onBlockUpdate);
      socket.off("chat:cleared", onCleared);
      socket.io.off("reconnect", onReconnect);
      socket.off("user:updated", onUserUpdated);
    };
  }, [socket, userId, loadChats, markSeen, patchChat, removeChat, setBlocked, clearLocal, patchUser, updateUser]);

  // add a new chat (or move an existing one) to the top
  const upsertChat = useCallback((chat) => {
    setChats((prev) => [{ unread: 0, ...chat }, ...prev.filter((c) => c._id !== chat._id)]);
  }, []);

  // after sending: update the sidebar preview and move the chat to the top
  const bumpLastMessage = useCallback((chatId, message) => {
    setChats((prev) => {
      const target = prev.find((c) => c._id === chatId);
      if (!target) return prev;
      const updated = {
        ...target,
        updatedAt: message.createdAt,
        lastMessage: toLastMessage(message),
      };
      return [updated, ...prev.filter((c) => c._id !== chatId)];
    });
  }, []);

  const items = useMemo(
    () =>
      chats.map((c) => ({
        ...toListItem(c, userId, onlineIds, lastSeen),
        typingNames: Object.values(typingByChat[c._id] ?? {}),
      })),
    [chats, userId, onlineIds, lastSeen, typingByChat]
  );

    const totalUnread = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unread || 0), 0),
    [chats]
  );

  useEffect(() => {
    document.title = totalUnread > 0 ? `(${totalUnread > 99 ? "99+" : totalUnread}) ChatRamel` : "ChatRamel";
    return () => {
      document.title = "ChatRamel";
    };
  }, [totalUnread]);

  const activeChat = chats.find((c) => c._id === activeChatId) || null;
  const activeItem = items.find((i) => i.id === activeChatId) || null;

  const value = {
    chats,
    items,
    loadingChats,
    activeChatId,
    activeChat,
    activeItem,
    clearSignal,
    selectChat: setActiveChatId,
    upsertChat,
    patchChat,
    removeChat,
    markLeaving,
    setBlocked,
    clearLocal,
    bumpLastMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}