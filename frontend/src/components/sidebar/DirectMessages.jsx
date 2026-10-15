import { useState } from "react";
import { Plus } from "lucide-react";
import ChatListItem from "./ChatListItem";
import NewChatModal from "../modals/NewChatModal";
import useChat from "../../hooks/useChat";

export default function DirectMessages() {
  const { items, activeChatId, selectChat, loadingChats } = useChat();
  const [open, setOpen] = useState(false);

  const dms = items.filter((c) => !c.isGroup);

  return (
    <section className="px-3 pb-3">
      <div className="flex items-center justify-between px-3 py-3">
        <h2 className="text-[15px] font-semibold text-gray-200">Direct Messages</h2>
        <button
          onClick={() => setOpen(true)}
          className="text-muted transition-colors hover:text-white"
          aria-label="New message"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-0.5">
        {loadingChats && <p className="px-3 py-2 text-sm text-muted">Loading chats...</p>}

        {!loadingChats && dms.length === 0 && (
          <p className="px-3 py-2 text-sm text-muted">No conversations yet. Click + to start one.</p>
        )}

        {dms.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            active={activeChatId === chat.id}
            onClick={() => selectChat(chat.id)}
          />
        ))}
      </div>

      {open && <NewChatModal onClose={() => setOpen(false)} />}
    </section>
  );
}