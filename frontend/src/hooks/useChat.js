import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

export default function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}