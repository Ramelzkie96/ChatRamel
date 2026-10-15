import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../utils/api";
import useAuth from "./useAuth";

// Every account API call lives here. Each function toasts its own result
// and returns true (worked) or false (failed), so modals know whether to close.
export default function useAccountActions() {
  const { updateUser, logout } = useAuth();
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

  // changes: { name?, username?, bio? }
  const updateProfile = (changes) =>
    attempt(async () => {
      updateUser(await api.patch("/account/profile", changes));
    }, "Profile updated.");

  const uploadAvatar = async (file) => {
    setUploading(true);
    const form = new FormData();
    form.append("avatar", file);

    const ok = await attempt(async () => {
      updateUser(await api.upload("/account/avatar", form));
    }, "Profile photo updated.");

    setUploading(false);
    return ok;
  };

  const removeAvatar = () =>
    attempt(async () => {
      updateUser(await api.delete("/account/avatar"));
    }, "Profile photo removed.");

  const changeEmail = ({ newEmail, password }) =>
    attempt(async () => {
      updateUser(await api.post("/account/email", { newEmail, password }));
    }, "Email address updated.");

  const changePassword = ({ currentPassword, newPassword }) =>
    attempt(async () => {
      await api.post("/account/password", { currentPassword, newPassword });
    }, "Password changed. Your other devices were signed out.");

  const deleteAccount = (password) =>
    attempt(async () => {
      await api.post("/account/delete", { password });
      await logout(); // clears the session and sends you to the login page
    }, "Your account was deleted.");

  return {
    uploading,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    changeEmail,
    changePassword,
    deleteAccount,
  };
}