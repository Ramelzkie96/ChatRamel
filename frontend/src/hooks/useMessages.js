import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../utils/api";
import useAuth from "./useAuth";
import useChat from "./useChat";
import useSocket from "./useSocket";

// merge by id so a message that arrives twice (REST + socket) only shows once
const merge = (prev, incoming) => {
  const map = new Map(prev.map((m) => [m._id, m]));
  incoming.forEach((m) => map.set(m._id, m));
  return [...map.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

export default function useMessages(chatId) {
  const { user } = useAuth();
  const { bumpLastMessage, clearSignal } = useChat();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesRef = useRef([]);
  const reactSeq = useRef(new Map()); // messageId -> number of my taps, so a late reply can't undo a newer tap
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // history: loaded once when the chat changes
  useEffect(() => {
    setMessages([]);
    if (!chatId) return;

    let cancelled = false;
    setLoading(true);

    api
      .get(`/messages/${chatId}`)
      .then((data) => !cancelled && setMessages((prev) => merge(prev, data)))
      .catch((err) => !cancelled && toast.error(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true; // ignore late responses from the previous chat
    };
  }, [chatId]);

  // this chat was cleared (here or in another tab): empty the list
  useEffect(() => {
    if (clearSignal && clearSignal.chatId === chatId) setMessages([]);
  }, [clearSignal, chatId]);

  const setReactions = useCallback((messageId, reactions) => {
    setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions } : m)));
  }, []);

  // live: new messages, seen receipts, reactions and profile changes for the open chat
  useEffect(() => {
    if (!socket || !chatId) return;

    const onNew = (message) => {
      if (message.chat !== chatId) return;
      setMessages((prev) => merge(prev, [message]));
    };

    const onSeen = ({ chatId: id, userId }) => {
      if (id !== chatId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.seenBy?.includes(userId) ? m : { ...m, seenBy: [...(m.seenBy || []), userId] }
        )
      );
    };

    const onReaction = ({ chatId: id, messageId, reactions }) => {
      if (id !== chatId) return;
      setReactions(messageId, reactions);
    };

    const onUserUpdated = ({ userId, name, avatar }) => {
      setMessages((prev) =>
        prev.map((m) => {
          const senderMatch = m.sender?._id === userId;
          const reactionMatch = m.reactions?.some((r) => r.user?._id === userId);
          if (!senderMatch && !reactionMatch) return m;

          return {
            ...m,
            sender: senderMatch ? { ...m.sender, name, avatar } : m.sender,
            reactions: reactionMatch
              ? m.reactions.map((r) =>
                  r.user?._id === userId ? { ...r, user: { ...r.user, name, avatar } } : r
                )
              : m.reactions,
          };
        })
      );
    };

    // after a dropped connection, reload to catch up
    const onReconnect = () => {
      api
        .get(`/messages/${chatId}`)
        .then((data) => setMessages((prev) => merge(prev, data)))
        .catch(() => {});
    };

    socket.on("message:new", onNew);
    socket.on("message:seen", onSeen);
    socket.on("message:reaction", onReaction);
    socket.on("user:updated", onUserUpdated);
    socket.io.on("reconnect", onReconnect);

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:seen", onSeen);
      socket.off("message:reaction", onReaction);
      socket.off("user:updated", onUserUpdated);
      socket.io.off("reconnect", onReconnect);
    };
  }, [socket, chatId, setReactions]);

  const send = useCallback(
    async (text) => {
      try {
        const message = await api.post(`/messages/${chatId}`, { text });
        setMessages((prev) => merge(prev, [message]));
        bumpLastMessage(chatId, message);
      } catch (err) {
        toast.error(err.message);
        throw err; // lets the input keep the text
      }
    },
    [chatId, bumpLastMessage]
  );

  // shared by photos and documents: field is "image" or "file"
  const upload = useCallback(
    async (route, field, file, caption) => {
      try {
        const form = new FormData();
        if (caption) form.append("text", caption);
        form.append(field, file);

        const message = await api.upload(`/messages/${chatId}/${route}`, form);
        setMessages((prev) => merge(prev, [message]));
        bumpLastMessage(chatId, message);
        return message;
      } catch (err) {
        toast.error(err.message);
        throw err; // lets the input keep the attachment and caption
      }
    },
    [chatId, bumpLastMessage]
  );

  const sendImage = useCallback((file, caption = "") => upload("image", "image", file, caption), [upload]);
  const sendFile = useCallback((file, caption = "") => upload("file", "file", file, caption), [upload]);

  // Tapping your own emoji again removes it; a different emoji replaces it.
  // The chip changes instantly, and rolls back with an error toast if the server says no.
  const react = useCallback(
    async (messageId, emoji) => {
      const current = messagesRef.current.find((m) => m._id === messageId);
      if (!current || !user) return;

      const previous = current.reactions ?? [];
      const mine = previous.find((r) => r.user?._id === user._id);
      const next = mine?.emoji === emoji ? null : emoji;

      const optimistic = [
        ...previous.filter((r) => r.user?._id !== user._id),
        ...(next
          ? [{ user: { _id: user._id, name: user.name, avatar: user.avatar }, emoji: next }]
          : []),
      ];

      const seq = (reactSeq.current.get(messageId) ?? 0) + 1;
      reactSeq.current.set(messageId, seq);
      setReactions(messageId, optimistic);

      try {
        const res = await api.put(`/messages/${chatId}/${messageId}/reaction`, { emoji: next });
        if (reactSeq.current.get(messageId) === seq) setReactions(messageId, res.reactions);
      } catch (err) {
        if (reactSeq.current.get(messageId) === seq) setReactions(messageId, previous);
        toast.error(err.message);
      }
    },
    [chatId, user, setReactions]
  );

  return { messages, loading, send, sendImage, sendFile, react };
}