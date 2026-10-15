import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import UserSearch from "./UserSearch";
import useChat from "../../hooks/useChat";
import { api } from "../../utils/api";

export default function NewChatModal({ onClose }) {
  const { upsertChat, selectChat } = useChat();
  const [busyId, setBusyId] = useState(null);

  const start = async (person) => {
    try {
      setBusyId(person._id);
      const chat = await api.post("/chats", { userId: person._id });
      upsertChat(chat);
      selectChat(chat._id);
      onClose();
    } catch (err) {
      toast.error(err.message);
      setBusyId(null);
    }
  };

  return (
    <Modal title="New message" onClose={onClose}>
      <UserSearch onPick={start} busyId={busyId} />
    </Modal>
  );
}