import { useState } from "react";
import { Mail } from "lucide-react";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import { isValidEmail } from "../../utils/validators";

// onSubmit({ newEmail, password }) must return a promise that resolves true when it worked
export default function ChangeEmailModal({ currentEmail, onSubmit, onClose }) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    const found = {};
    const email = newEmail.trim().toLowerCase();
    if (!email) found.newEmail = "Enter your new email address.";
    else if (!isValidEmail(email)) found.newEmail = "Enter a valid email address.";
    else if (email === currentEmail) found.newEmail = "That's already your email address.";
    if (!password) found.password = "Enter your current password.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    const ok = await onSubmit({ newEmail: email, password });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Modal title="Change email" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <p className="text-sm text-muted">
          Current email: <span className="text-gray-200">{currentEmail}</span>
        </p>

        <TextInput
          label="New email address"
          name="newEmail"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
          value={newEmail}
          onChange={(e) => {
            setNewEmail(e.target.value);
            setErrors((prev) => ({ ...prev, newEmail: undefined }));
          }}
          error={errors.newEmail}
        />

        <PasswordInput
          label="Current password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
        />

        <Button type="submit" loading={loading}>
          Update email
        </Button>
      </form>
    </Modal>
  );
}