import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../utils/api";
import useChat from "./useChat";
import useSocket from "./useSocket";

// newest first, no duplicates
const mergeItems = (prev, incoming) => {
  const map = new Map(prev.map((i) => [i._id, i]));
  incoming.forEach((i) => map.set(i._id, i));
  return [...map.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// type: "images" | "files". Updates live when someone sends a new photo or file.
export default function useSharedMedia(chatId, type, { limit = 30 } = {}) {
  const socket = useSocket();
  const { clearSignal } = useChat();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(chatId));
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const url = useCallback(
    (before) =>
      `/chats/${chatId}/media?type=${type}&limit=${limit}` +
      (before ? `&before=${encodeURIComponent(before)}` : ""),
    [chatId, type, limit]
  );

  // first page, whenever the chat or the tab changes
  useEffect(() => {
    setItems([]);
    setHasMore(false);
    if (!chatId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .get(url())
      .then((data) => {
        if (cancelled) return;
        setItems((prev) => mergeItems(prev, data));
        setHasMore(data.length === limit);
      })
      .catch((err) => !cancelled && toast.error(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [chatId, type, limit, url]);

  // this chat was cleared: nothing left to show
  useEffect(() => {
    if (clearSignal && clearSignal.chatId === chatId) {
      setItems([]);
      setHasMore(false);
    }
  }, [clearSignal, chatId]);

  // live: a new photo or file arrives in this chat
  useEffect(() => {
    if (!socket || !chatId) return;

    const onNew = (message) => {
      if (message.chat !== chatId) return;
      if (!(type === "images" ? message.image : message.file?.url)) return;

      setItems((prev) =>
        mergeItems(prev, [
          {
            _id: message._id,
            image: message.image,
            file: message.file,
            text: message.text,
            createdAt: message.createdAt,
            sender: message.sender,
          },
        ])
      );
    };

    socket.on("message:new", onNew);
    return () => socket.off("message:new", onNew);
  }, [socket, chatId, type]);

  const loadMore = useCallback(async () => {
    const last = items.at(-1);
    if (!last || loadingMore) return;

    try {
      setLoadingMore(true);
      const data = await api.get(url(last.createdAt));
      setItems((prev) => mergeItems(prev, data));
      setHasMore(data.length === limit);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [items, loadingMore, url, limit]);

  return { items, loading, loadingMore, hasMore, loadMore };
}