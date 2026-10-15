import { Users, Plus } from "lucide-react";

export default function GroupsHeader({ onNew }) {
  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-hover text-blue-400">
          <Users size={22} />
        </span>
        <h2 className="text-xl font-semibold">Groups</h2>
      </div>

      <button
        type="button"
        onClick={onNew}
        aria-label="New group"
        className="rounded-lg p-2 text-muted transition-colors hover:bg-hover hover:text-white"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}