import { useState } from "react";
import Modal from "../ui/Modal";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import { validatePasswordChange } from "../../utils/validators";

// onSubmit({ currentPassword, newPassword }) must return a promise that resolves true when it worked
export default function ChangePasswordModal({ onSubmit, onClose }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const found = validatePasswordChange(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    const ok = await onSubmit({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Modal title="Change password" onClose={onClose}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <PasswordInput
          label="Current password"
          name="currentPassword"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={handleChange}
          error={errors.currentPassword}
        />
        <PasswordInput
          label="New password"
          name="newPassword"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={form.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
        />
        <PasswordInput
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <p className="text-xs text-muted">
          You'll stay signed in here. Your other devices will be signed out.
        </p>

        <Button type="submit" loading={loading}>
          Change password
        </Button>
      </form>
    </Modal>
  );
}