import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import CategoryBadge from "../ui/CategoryBadge";
import GroupIcon from "../groups/GroupIcon";

const firstName = (n = "") => n.split(" ")[0];

export default function ChatListItem({ chat, active, onClick }) {
  const typing = chat.typingNames?.length > 0;
  const hasUnread = chat.unread > 0;

  const preview = typing
    ? chat.isGroup
      ? `${firstName(chat.typingNames[0])} is typing...`
      : "typing..."
    : chat.lastMessage;

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        active ? "bg-accent/30" : "hover:bg-hover"
      }`}
    >
      {chat.isGroup ? (
        <GroupIcon src={chat.avatar} category={chat.category} name={chat.name} size={42} />
      ) : (
        <Avatar name={chat.name} src={chat.avatar} status={chat.status} size={42} />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-[15px] font-medium">{chat.name}</p>
            {chat.isGroup && <CategoryBadge id={chat.category} />}
          </div>
          <span className={`shrink-0 text-xs ${hasUnread ? "text-blue-400" : "text-muted"}`}>
            {chat.time}
          </span>
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p
            className={`truncate text-sm ${
              typing ? "text-blue-400" : hasUnread ? "font-medium text-gray-200" : "text-muted"
            }`}
          >
            {preview}
          </p>
          <Badge count={chat.unread} />
        </div>
      </div>
    </button>
  );
}