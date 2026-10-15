import { useCallback, useEffect, useRef, useState } from "react";
import useSocket from "./useSocket";

/* ---------- emits YOUR typing events ---------- */
export function useTypingEmitter(chatId) {
  const socket = useSocket();
  const typingRef = useRef(false);
  const lastEmitRef = useRef(0);
  const timerRef = useRef(null);

  const stopTyping = useCallback(() => {
    clearTimeout(timerRef.current);
    if (typingRef.current && socket && chatId) {
      socket.emit("typing:stop", { chatId });
    }
    typingRef.current = false;
  }, [socket, chatId]);

  // call this on every keystroke
  const notifyTyping = useCallback(() => {
    if (!socket || !chatId) return;

    const now = Date.now();
    // re-send every 2.5s so the other side's 4s auto-clear never fires while you keep typing
    if (!typingRef.current || now - lastEmitRef.current > 2500) {
      socket.emit("typing:start", { chatId });
      lastEmitRef.current = now;
    }
    typingRef.current = true;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(stopTyping, 2000);
  }, [socket, chatId, stopTyping]);

  // switching chats (or leaving) counts as "stopped typing"
  useEffect(() => stopTyping, [stopTyping]);

  return { notifyTyping, stopTyping };
}

/* ---------- tracks who ELSE is typing, in every chat ---------- */
export function useTypingTracker() {
  const socket = useSocket();
  const [typing, setTyping] = useState({}); // { chatId: { userId: name } }
  const timers = useRef(new Map());

  useEffect(() => {
    if (!socket) return;

    const clearUser = (chatId, userId) => {
      const key = `${chatId}:${userId}`;
      clearTimeout(timers.current.get(key));
      timers.current.delete(key);

      setTyping((prev) => {
        if (!prev[chatId]?.[userId]) return prev;
        const rest = { ...prev[chatId] };
        delete rest[userId];
        const next = { ...prev, [chatId]: rest };
        if (Object.keys(rest).length === 0) delete next[chatId];
        return next;
      });
    };

    const onUpdate = ({ chatId, userId, name, isTyping }) => {
      if (!isTyping) return clearUser(chatId, userId);

      setTyping((prev) => ({ ...prev, [chatId]: { ...prev[chatId], [userId]: name } }));

      // safety net in case the "stop" event is lost
      const key = `${chatId}:${userId}`;
      clearTimeout(timers.current.get(key));
      timers.current.set(key, setTimeout(() => clearUser(chatId, userId), 4000));
    };

    socket.on("typing:update", onUpdate);

    return () => {
      socket.off("typing:update", onUpdate);
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    };
  }, [socket]);

  return typing;
}