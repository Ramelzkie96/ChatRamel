import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";

// onSubmit(password) must return a promise that resolves true when it worked
export default function DeleteAccountModal({ onSubmit, onClose }) {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const ready = password.length > 0 && confirmText === "DELETE";

  const submit = async (e) => {
    e.preventDefault();
    if (!ready) return;

    setLoading(true);
    const ok = await onSubmit(password);
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Modal title="Delete account" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 p-4 text-sm leading-relaxed text-red-200">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-400" />
          <p>
            This can't be undone. You'll leave all your groups, and your contacts, notifications and
            profile will be removed. Messages you sent stay in other people's chats under "Deleted
            user".
          </p>
        </div>

        <PasswordInput
          label="Your password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <TextInput
          label='Type "DELETE" to confirm'
          name="confirmText"
          autoComplete="off"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />

        <Button type="submit" variant="danger" loading={loading} disabled={!ready}>
          Delete my account
        </Button>
      </form>
    </Modal>
  );
}