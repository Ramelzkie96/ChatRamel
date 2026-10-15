import { createContext, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../utils/api";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import useChat from "../hooks/useChat";
import { alertNotification } from "../utils/notificationAlert";

export const NotificationContext = createContext(null);

const PAGE = 30;

// notification shape: { _id, type, actor: { _id, name, avatar } | null, chat, text, meta, readAt, createdAt }
export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const socket = useSocket();
  const { chats, selectChat } = useChat();
  const userId = user?._id;

  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // socket handlers read the latest values through refs, so they don't re-subscribe constantly
  const itemsRef = useRef([]);
  const chatsRef = useRef([]);
  const selectRef = useRef(selectChat);
  const panelOpenRef = useRef(false);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    chatsRef.current = chats;
    selectRef.current = selectChat;
  }, [chats, selectChat]);

  const refreshCount = useCallback(async () => {
    try {
      const { count } = await api.get("/notifications/unread-count");
      setUnread(count);
    } catch {
      // the next event or reload fixes the number
    }
  }, []);

  const load = useCallback(async (silent = false) => {
    try {
      const [data, countRes] = await Promise.all([
        api.get(`/notifications?limit=${PAGE}`),
        api.get("/notifications/unread-count"),
      ]);
      setItems(data);
      setHasMore(data.length === PAGE);
      setUnread(countRes.count);
    } catch (err) {
      if (!silent) toast.error(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) load();
  }, [userId, load]);

  const loadMore = useCallback(async () => {
    const last = itemsRef.current.at(-1);
    if (!last || loadingMore) return;

    try {
      setLoadingMore(true);
      const data = await api.get(
        `/notifications?limit=${PAGE}&before=${encodeURIComponent(last.createdAt)}`
      );
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i._id));
        return [...prev, ...data.filter((i) => !seen.has(i._id))];
      });
      setHasMore(data.length === PAGE);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore]);

  // the panel tells us when it's open, so new arrivals while you're looking aren't "new"
  const setPanelOpen = useCallback((open) => {
    panelOpenRef.current = open;
  }, []);

  /* ---------- actions (instant on screen, then saved) ---------- */
  const markRead = useCallback(
    async (ids) => {
      const unreadIds = itemsRef.current
        .filter((i) => ids.includes(i._id) && !i.readAt)
        .map((i) => i._id);
      if (unreadIds.length === 0) return;

      const now = new Date().toISOString();
      setItems((prev) => prev.map((i) => (unreadIds.includes(i._id) ? { ...i, readAt: now } : i)));
      setUnread((c) => Math.max(0, c - unreadIds.length));

      try {
        await api.patch("/notifications/read", { ids: unreadIds });
      } catch (err) {
        toast.error(err.message);
        load(true);
      }
    },
    [load]
  );

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((i) => (i.readAt ? i : { ...i, readAt: now })));
    setUnread(0);

    try {
      await api.patch("/notifications/read", { all: true });
    } catch (err) {
      toast.error(err.message);
      load(true);
    }
  }, [load]);

  const remove = useCallback(
    async (id) => {
      const target = itemsRef.current.find((i) => i._id === id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      if (target && !target.readAt) setUnread((c) => Math.max(0, c - 1));

      try {
        await api.delete(`/notifications/${id}`);
      } catch (err) {
        toast.error(err.message);
        load(true);
      }
    },
    [load]
  );

  // returns true when it worked, so the confirm dialog knows whether to close
  const clearAll = useCallback(async () => {
    try {
      await api.delete("/notifications");
      setItems([]);
      setUnread(0);
      setHasMore(false);
      toast.success("Notifications cleared.");
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  }, []);

  /* ---------- live events ---------- */
  useEffect(() => {
    if (!socket || !userId) return;

    const onNew = (n) => {
      if (itemsRef.current.some((i) => i._id === n._id)) return;

      const viewing = panelOpenRef.current && document.visibilityState === "visible";

      if (viewing) {
        // you're looking at the list right now, so it counts as read
        setItems((prev) =>
          prev.some((i) => i._id === n._id)
            ? prev
            : [{ ...n, readAt: new Date().toISOString() }, ...prev]
        );
        api.patch("/notifications/read", { ids: [n._id] }).catch(() => {});
        return;
      }

      setItems((prev) => (prev.some((i) => i._id === n._id) ? prev : [n, ...prev]));
      setUnread((c) => c + 1);

      alertNotification({
        notification: n,
        onOpen: () => {
          if (n.chat && chatsRef.current.some((c) => c._id === n.chat)) selectRef.current(n.chat);
        },
      });
    };

    // something was read or deleted in another tab (or this one): make this tab match
    const onSync = ({ action, ids = [] }) => {
      const now = new Date().toISOString();

      if (action === "read") {
        setItems((prev) =>
          prev.map((i) => (ids.includes(i._id) && !i.readAt ? { ...i, readAt: now } : i))
        );
        refreshCount();
      } else if (action === "readAll") {
        setItems((prev) => prev.map((i) => (i.readAt ? i : { ...i, readAt: now })));
        setUnread(0);
      } else if (action === "delete") {
        setItems((prev) => prev.filter((i) => !ids.includes(i._id)));
        refreshCount();
      } else if (action === "clear") {
        setItems([]);
        setUnread(0);
        setHasMore(false);
      }
    };

    // after a dropped connection, catch up on anything we missed
    const onReconnect = () => load(true);

    socket.on("notification:new", onNew);
    socket.on("notification:sync", onSync);
    socket.io.on("reconnect", onReconnect);

    return () => {
      socket.off("notification:new", onNew);
      socket.off("notification:sync", onSync);
      socket.io.off("reconnect", onReconnect);
    };
  }, [socket, userId, load, refreshCount]);

  const value = {
    items,
    unread,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
    remove,
    clearAll,
    setPanelOpen,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}