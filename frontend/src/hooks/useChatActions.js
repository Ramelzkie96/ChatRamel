import toast from "react-hot-toast";
import { api } from "../utils/api";
import useChat from "./useChat";

// Block, unblock, clear and report for a direct chat.
// Each function toasts its own result and returns true (worked) or false (failed),
// so modals know whether to close.
export default function useChatActions(chatId, otherId, otherName = "this person") {
  const { setBlocked, clearLocal } = useChat();

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

  const block = () =>
    attempt(async () => {
      await api.post(`/users/${otherId}/block`);
      setBlocked(otherId, true);
    }, `${otherName} was blocked.`);

  const unblock = () =>
    attempt(async () => {
      await api.delete(`/users/${otherId}/block`);
      setBlocked(otherId, false);
    }, `${otherName} was unblocked.`);

  const clear = () =>
    attempt(async () => {
      await api.post(`/chats/${chatId}/clear`);
      clearLocal(chatId);
    }, "Chat cleared.");

  // { reason, details, alsoBlock }
  const report = ({ reason, details, alsoBlock }) =>
    attempt(
      async () => {
        await api.post("/reports", { userId: otherId, chatId, reason, details, alsoBlock });
        if (alsoBlock) setBlocked(otherId, true);
      },
      alsoBlock ? "Report sent and user blocked." : "Report sent. Thank you."
    );

  return { block, unblock, clear, report };
}