import { useState } from "react";
import { Users, X } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import Button from "../ui/Button";
import CategoryPicker from "../ui/CategoryPicker";
import UserSearch from "./UserSearch";
import useChat from "../../hooks/useChat";
import { api } from "../../utils/api";

export default function NewGroupModal({ onClose }) {
  const { upsertChat, selectChat } = useChat();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [selected, setSelected] = useState([]); // user objects
  const [loading, setLoading] = useState(false);

  const toggle = (person) =>
    setSelected((prev) =>
      prev.some((p) => p._id === person._id)
        ? prev.filter((p) => p._id !== person._id)
        : [...prev, person]
    );

  const create = async () => {
    if (!name.trim()) return toast.error("Group name is required.");
    if (!category) return setCategoryError("Choose a category.");
    if (selected.length < 1) return toast.error("Add at least one member.");

    try {
      setLoading(true);
      const chat = await api.post("/chats/group", {
        name,
        category,
        members: selected.map((s) => s._id),
      });
      upsertChat(chat);
      selectChat(chat._id);
      toast.success(`${chat.name} created!`);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create group" onClose={onClose}>
      <TextInput
        label="Group name"
        name="groupName"
        icon={Users}
        placeholder="Dev Team"
        maxLength={60}
        value={name}
        onChange={(e) => setName(e.target.value)}
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

      <p className="mb-2 mt-5 text-[15px] font-medium">Add members</p>

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

      <UserSearch onPick={toggle} selectedIds={selected.map((s) => s._id)} />

      <div className="mt-5">
        <Button type="button" loading={loading} onClick={create}>
          Create Group
        </Button>
      </div>
    </Modal>
  );
}