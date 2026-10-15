import { useState } from "react";
import { Users } from "lucide-react";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import Button from "../ui/Button";
import CategoryPicker from "../ui/CategoryPicker";

export default function EditGroupModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial.name || "");
  const [description, setDescription] = useState(initial.description || "");
  const [category, setCategory] = useState(initial.category || "");
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    const newName = name.trim();
    const newDesc = description.trim();

    if (!newName) return setError("Group name is required.");
    if (!category) return setCategoryError("Choose a category.");
    setError("");

    // only send what actually changed
    const changes = {};
    if (newName !== initial.name) changes.name = newName;
    if (newDesc !== (initial.description || "")) changes.description = newDesc;
    if (category !== (initial.category || "")) changes.category = category;

    if (Object.keys(changes).length === 0) return onClose();

    setLoading(true);
    const ok = await onSave(changes);
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Modal title="Edit group" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <TextInput
          label="Group name"
          name="groupName"
          icon={Users}
          maxLength={60}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          error={error}
        />

        <div className="mt-5">
          <CategoryPicker
            value={category}
            onChange={(id) => {
              setCategory(id);
              setCategoryError("");
            }}
            error={categoryError}
          />
        </div>

        <div className="mt-5">
          <label htmlFor="groupDescription" className="mb-2 block text-[15px] font-medium text-white">
            Description
          </label>
          <textarea
            id="groupDescription"
            rows={4}
            maxLength={200}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this group about?"
            className="w-full resize-none rounded-xl border border-line bg-[#0a1226] px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
          <p className="mt-1 text-right text-xs text-muted">{description.length}/200</p>
        </div>

        <div className="mt-5">
          <Button type="submit" loading={loading}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}