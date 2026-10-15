import GroupIcon from "./GroupIcon";
import Badge from "../ui/Badge";

const firstName = (n = "") => n.split(" ")[0];

export default function GroupListItem({ chat, active, onClick }) {
  const typing = chat.typingNames?.length > 0;
  const hasUnread = chat.unread > 0;
  const preview = typing ? `${firstName(chat.typingNames[0])} is typing...` : chat.lastMessage;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
        active ? "bg-accent/30" : "hover:bg-hover"
      }`}
    >
      <GroupIcon src={chat.avatar} category={chat.category} name={chat.name} size={52} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[15px] font-semibold">{chat.name}</p>
          <span className={`shrink-0 text-xs ${hasUnread ? "text-blue-400" : "text-muted"}`}>
            {chat.time}
          </span>
        </div>

        <p className="text-sm text-muted">{chat.memberCount} members</p>

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