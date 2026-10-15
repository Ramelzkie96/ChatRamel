import { useState } from "react";
import { Plus } from "lucide-react";
import ChatListItem from "./ChatListItem";
import NewGroupModal from "../modals/NewGroupModal";
import useChat from "../../hooks/useChat";
import { CATEGORIES } from "../../utils/groupCategories";

export default function GroupChats({ collapsed = false }) {
  const { items, activeChatId, selectChat, loadingChats } = useChat();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const groups = items.filter((c) => c.isGroup);
  const shown = filter === "all" ? groups : groups.filter((g) => g.category === filter);

  const tabs = [{ id: "all", label: "All" }, ...CATEGORIES];

  return (
    <section className="border-t border-line px-3 pb-3">
      <div className="flex items-center justify-between px-3 py-3">
        <h2 className="text-[15px] font-semibold text-gray-200">Group Chats</h2>
        <button
          onClick={() => setOpen(true)}
          className="text-muted transition-colors hover:text-white"
          aria-label="New group"
        >
          <Plus size={20} />
        </button>
      </div>

      {!collapsed && groups.length > 0 && (
        <div className="mb-2 flex gap-1.5 px-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              aria-pressed={filter === t.id}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === t.id ? "bg-accent text-white" : "bg-hover text-muted hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {!collapsed && (
        <div className="flex flex-col gap-0.5">
          {!loadingChats && groups.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted">No groups yet. Click + to create one.</p>
          )}

          {groups.length > 0 && shown.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted">No groups in this category.</p>
          )}

          {shown.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              active={activeChatId === chat.id}
              onClick={() => selectChat(chat.id)}
            />
          ))}
        </div>
      )}

      {open && <NewGroupModal onClose={() => setOpen(false)} />}
    </section>
  );
}