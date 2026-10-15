import { Users, Plus } from "lucide-react";

export default function ContactsHeader({ onAdd }) {
  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-hover text-blue-400">
          <Users size={22} />
        </span>
        <h2 className="text-xl font-semibold">Contacts</h2>
      </div>

      <button
        type="button"
        onClick={onAdd}
        aria-label="Add contact"
        className="rounded-lg p-2 text-muted transition-colors hover:bg-hover hover:text-white"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}