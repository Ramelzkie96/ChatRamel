import toast from "react-hot-toast";
import { api } from "../utils/api";
import useAuth from "./useAuth";
import useChat from "./useChat";
import useCall from "./useCall";
import useContacts from "./useContacts";
import { toListItem } from "../utils/chatHelpers";

// Everything you can do with a contact. `person` is { _id, name, email?, avatar? }.
// The async actions toast their own result and return true (worked) or false (failed),
// so confirm modals know whether to close.
export default function useContactActions() {
  const { user } = useAuth();
  const { upsertChat, selectChat, setBlocked } = useChat();
  const { startCall } = useCall();
  const { addContact, removeContact, setFavorite, applyBlock } = useContacts();

  const attempt = async (job, successMessage) => {
    try {
      await job();
      if (successMessage) toast.success(successMessage);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  // opens (or creates) the direct chat with this person
  const openChat = async (person) => {
    try {
      const chat = await api.post("/chats", { userId: person._id });
      upsertChat(chat);
      selectChat(chat._id);
      return chat;
    } catch (err) {
      toast.error(err.message);
      return null;
    }
  };

  const message = async (person) => {
    await openChat(person);
  };

  // type: "audio" | "video"
  const call = async (person, type) => {
    const chat = await openChat(person);
    if (chat) startCall(toListItem(chat, user._id), type);
  };

  const add = (person) =>
    attempt(() => addContact(person._id), `${person.name} was added to your contacts.`);

  const remove = (person) =>
    attempt(() => removeContact(person._id), `${person.name} was removed from your contacts.`);

  const toggleFavorite = (item) =>
    attempt(
      () => setFavorite(item.user._id, !item.favorite),
      item.favorite ? "Removed from favorites." : "Added to favorites."
    );

  const block = (person) =>
    attempt(async () => {
      await api.post(`/users/${person._id}/block`);
      setBlocked(person._id, true); // the direct chat's banner
      applyBlock(person._id, true, person); // the contact lists
    }, `${person.name} was blocked.`);

  const unblock = (person) =>
    attempt(async () => {
      await api.delete(`/users/${person._id}/block`);
      setBlocked(person._id, false);
      applyBlock(person._id, false);
    }, `${person.name} was unblocked.`);

  return { openChat, message, call, add, remove, toggleFavorite, block, unblock };
}