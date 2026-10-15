import { createContext, useEffect, useMemo, useState } from "react";
import useSocket from "../hooks/useSocket";

export const PresenceContext = createContext(null);

export function PresenceProvider({ children }) {
  const socket = useSocket();
  const [onlineIds, setOnlineIds] = useState(() => new Set());
  const [lastSeen, setLastSeen] = useState({}); // userId -> ISO date

  useEffect(() => {
    if (!socket) return;

    // full list, sent once on every (re)connect
    const onInit = (ids) => setOnlineIds(new Set(ids));

    const onUpdate = ({ userId, status, lastSeen: seen }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev);
        if (status === "online") next.add(userId);
        else next.delete(userId);
        return next;
      });
      if (seen) setLastSeen((prev) => ({ ...prev, [userId]: seen }));
    };

    // if the server drops, we can't know who is online anymore
    const onDisconnect = () => setOnlineIds(new Set());

    socket.on("presence:init", onInit);
    socket.on("presence:update", onUpdate);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("presence:init", onInit);
      socket.off("presence:update", onUpdate);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  const value = useMemo(() => ({ onlineIds, lastSeen }), [onlineIds, lastSeen]);

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}