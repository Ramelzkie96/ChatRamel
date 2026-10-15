import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../utils/api";
import useChat from "./useChat";

// Every group API call lives here. Each function toasts its own result
// and returns true (success) or false (failed), so modals know whether to close.
export default function useGroupActions(chatId) {
  const { patchChat, removeChat, markLeaving, upsertChat, selectChat } = useChat();
  const [uploading, setUploading] = useState(false);

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

  // changes: { name?, description?, category? }
  const updateGroup = (changes) =>
    attempt(async () => {
      patchChat(await api.patch(`/chats/${chatId}/group`, changes));
    }, "Group updated.");

  const uploadCover = async (file) => {
    setUploading(true);
    const form = new FormData();
    form.append("cover", file);

    const ok = await attempt(async () => {
      patchChat(await api.upload(`/chats/${chatId}/cover`, form));
    }, "Group photo updated.");

    setUploading(false);
    return ok;
  };

  const addMembers = (userIds) =>
    attempt(async () => {
      patchChat(await api.post(`/chats/${chatId}/members`, { userIds }));
    }, userIds.length > 1 ? "Members added." : "Member added.");

  const removeMember = (userId, name) =>
    attempt(async () => {
      patchChat(await api.delete(`/chats/${chatId}/members/${userId}`));
    }, `${name} was removed.`);

  // role: "admin" | "member"
  const setRole = (userId, name, role) =>
    attempt(
      async () => {
        patchChat(await api.patch(`/chats/${chatId}/members/${userId}/role`, { role }));
      },
      role === "admin" ? `${name} is now an admin.` : `${name} is no longer an admin.`
    );

  // opens (or creates) the direct chat with a member
  const messageMember = (userId) =>
    attempt(async () => {
      const chat = await api.post("/chats", { userId });
      upsertChat(chat);
      selectChat(chat._id);
    });

  const leave = async (groupName) => {
    // tells ChatContext this removal was my own choice, so it won't show a second toast
    const cancel = markLeaving(chatId);
    try {
      await api.post(`/chats/${chatId}/leave`);
      removeChat(chatId);
      toast.success(`You left ${groupName}.`);
      return true;
    } catch (err) {
      cancel();
      toast.error(err.message);
      return false;
    }
  };

  return {
    uploading,
    updateGroup,
    uploadCover,
    addMembers,
    removeMember,
    setRole,
    messageMember,
    leave,
  };
}