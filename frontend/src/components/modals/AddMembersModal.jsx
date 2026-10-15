import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import UserSearch from "./UserSearch";

export default function AddMembersModal({ existingIds = [], onAdd, onClose }) {
  const [selected, setSelected] = useState([]); // user objects
  const [loading, setLoading] = useState(false);

  const toggle = (person) =>
    setSelected((prev) =>
      prev.some((p) => p._id === person._id)
        ? prev.filter((p) => p._id !== person._id)
        : [...prev, person]
    );

  const submit = async () => {
    if (selected.length === 0) return toast.error("Choose at least one person.");

    setLoading(true);
    const ok = await onAdd(selected.map((s) => s._id));
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Modal title="Add members" onClose={onClose}>
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((p) => (
            <span
              key={p._id}
              className="flex items-center gap-1.5 rounded-full bg-accent/20 py-1 pl-3 pr-2 text-sm text-blue-300"
            >
              {p.name}
              <button
                type="button"
                onClick={() => toggle(p)}
                aria-label={`Remove ${p.name}`}
                className="hover:text-white"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <UserSearch
        onPick={toggle}
        selectedIds={selected.map((s) => s._id)}
        disabledIds={existingIds}
      />

      <div className="mt-5">
        <Button type="button" loading={loading} onClick={submit} disabled={selected.length === 0}>
          {selected.length > 1 ? `Add ${selected.length} people` : "Add to group"}
        </Button>
      </div>
    </Modal>
  );
}