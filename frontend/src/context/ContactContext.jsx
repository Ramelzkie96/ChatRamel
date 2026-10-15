import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../utils/api";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";

export const ContactContext = createContext(null);

// contact shape: { user: { _id, name, email, avatar, bio, lastSeen }, favorite, createdAt, blockedByMe }
export function ContactProvider({ children }) {
  const { user } = useAuth();
  const socket = useSocket();
  const userId = user?._id;

  const [contacts, setContacts] = useState([]);
  const [blocked, setBlocked] = useState([]); // people I blocked: { _id, name, email, avatar }
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    try {
      const [contactRows, blockedRows] = await Promise.all([
        api.get("/contacts"),
        api.get("/users/blocked"),
      ]);
      setContacts(contactRows);
      setBlocked(blockedRows);
    } catch (err) {
      if (!silent) toast.error(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) load();
  }, [userId, load]);

  // add or replace one contact (safe to call twice with the same data)
  const upsert = useCallback((contact) => {
    setContacts((prev) =>
      prev.some((c) => c.user._id === contact.user._id)
        ? prev.map((c) => (c.user._id === contact.user._id ? contact : c))
        : [...prev, contact]
    );
  }, []);

  // I blocked / unblocked someone: update the flag on their contact row and the Blocked list
  const applyBlock = useCallback((otherId, isBlocked, info) => {
    setContacts((prev) =>
      prev.map((c) => (c.user._id === otherId ? { ...c, blockedByMe: isBlocked } : c))
    );
    setBlocked((prev) => {
      if (!isBlocked) return prev.filter((u) => u._id !== otherId);
      if (!info || prev.some((u) => u._id === otherId)) return prev;
      return [{ _id: otherId, name: info.name, email: info.email, avatar: info.avatar }, ...prev];
    });
  }, []);

  // live events from my own other tabs
  useEffect(() => {
    if (!socket || !userId) return;

    const onContact = ({ action, contact }) => {
      if (action === "remove") {
        setContacts((prev) => prev.filter((c) => c.user._id !== contact.user._id));
      } else {
        upsert(contact); // "add" and "favorite"
      }
    };

        const onUserUpdated = (u) => {
      setContacts((prev) =>
        prev.map((c) =>
          c.user._id === u.userId
            ? { ...c, user: { ...c.user, name: u.name, avatar: u.avatar, bio: u.bio } }
            : c
        )
      );
    };

    // fired in the tab that did it too, so every tab ends up the same
    const onBlockUpdate = ({ userId: otherId, blocked: isBlocked }) => {
      applyBlock(otherId, isBlocked);
      if (isBlocked) {
        api.get("/users/blocked").then(setBlocked).catch(() => {});
      }
    };

    const onReconnect = () => load(true);

    socket.on("contact:update", onContact);
    socket.on("block:update", onBlockUpdate);
    socket.io.on("reconnect", onReconnect);
    socket.on("user:updated", onUserUpdated);

    return () => {
      socket.off("contact:update", onContact);
      socket.off("block:update", onBlockUpdate);
      socket.io.off("reconnect", onReconnect);
      socket.off("user:updated", onUserUpdated);
      
    };
  }, [socket, userId, upsert, applyBlock, load]);

  // these throw on failure, so the caller decides what to toast
  const addContact = useCallback(
    async (id) => {
      const contact = await api.post("/contacts", { userId: id });
      upsert(contact);
      return contact;
    },
    [upsert]
  );

  const removeContact = useCallback(async (id) => {
    await api.delete(`/contacts/${id}`);
    setContacts((prev) => prev.filter((c) => c.user._id !== id));
  }, []);

  const setFavorite = useCallback(
    async (id, favorite) => {
      upsert(await api.patch(`/contacts/${id}`, { favorite }));
    },
    [upsert]
  );

  const contactIds = useMemo(() => new Set(contacts.map((c) => c.user._id)), [contacts]);
  const isContact = useCallback((id) => contactIds.has(id), [contactIds]);

  const value = {
    contacts,
    blocked,
    loading,
    contactIds,
    isContact,
    addContact,
    removeContact,
    setFavorite,
    applyBlock,
  };

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}