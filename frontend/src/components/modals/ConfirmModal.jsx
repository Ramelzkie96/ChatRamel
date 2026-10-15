import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

// onConfirm must return a promise that resolves true when it worked
export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onClose,
}) {
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    const ok = await onConfirm();
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-[15px] leading-relaxed text-gray-300">{message}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="button"
          variant={danger ? "danger" : "primary"}
          loading={loading}
          onClick={confirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}