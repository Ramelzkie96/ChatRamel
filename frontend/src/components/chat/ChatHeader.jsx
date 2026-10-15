import { Menu, ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import Avatar from "../ui/Avatar";
import GroupIcon from "../groups/GroupIcon";
import useCall from "../../hooks/useCall";
import { formatLastSeen } from "../../utils/chatHelpers";
import { getCategory } from "../../utils/groupCategories";

const firstName = (n = "") => n.split(" ")[0];

export default function ChatHeader({ chat, typingNames = [], onToggleInfo, onOpenMenu }) {
  const { startCall, inCall } = useCall();
  const typing = typingNames.length > 0;

  const callDisabled = chat.isGroup || chat.blockedByMe || inCall;
  const callTitle = chat.isGroup
    ? "Calls are only available in direct chats"
    : chat.blockedByMe
    ? "Unblock to call"
    : inCall
    ? "You're already in a call"
    : undefined;

  let subtitle;
  if (typing) {
    subtitle = chat.isGroup
      ? `${typingNames.map(firstName).join(", ")} ${typingNames.length > 1 ? "are" : "is"} typing...`
      : "typing...";
  } else if (chat.isGroup) {
    const category = getCategory(chat.category)?.label;
    subtitle = `${chat.memberCount} members${category ? ` • ${category}` : ""}`;
  } else if (chat.blockedByMe) {
    subtitle = "Blocked"; // no Online / Last seen for someone you blocked
  } else if (chat.status === "online") {
    subtitle = "Online";
  } else {
    subtitle = chat.lastSeen ? `Last seen ${formatLastSeen(chat.lastSeen)}` : "Offline";
  }

  const iconButton =
    "rounded-lg p-2 text-gray-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-gray-300";

  return (
    <header className="flex items-center justify-between gap-2 border-b border-line px-2 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {/* phones: opens the chat list */}
        <button
          aria-label="Open menu"
          onClick={onOpenMenu}
          className="rounded-lg p-2 text-gray-300 transition-colors hover:text-white md:hidden"
        >
          <Menu size={22} />
        </button>
        <button
          aria-label="Back"
          className="hidden text-gray-300 transition-colors hover:text-white md:block"
        >
          <ArrowLeft size={22} />
        </button>

        {chat.isGroup ? (
          <GroupIcon src={chat.avatar} category={chat.category} name={chat.name} size={42} />
        ) : (
          <Avatar name={chat.name} src={chat.avatar} status={chat.status} size={42} />
        )}

        <div className="min-w-0">
          <h2 className="truncate text-[17px] font-semibold leading-tight">{chat.name}</h2>
          <p
            className={`flex items-center gap-1.5 text-sm ${
              typing ? "text-blue-400" : "text-muted"
            }`}
          >
            {!typing && chat.status === "online" && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
            )}
            <span className="truncate">{subtitle}</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-3">
        <button
          aria-label="Voice call"
          title={callTitle}
          disabled={callDisabled}
          onClick={() => startCall(chat, "audio")}
          className={iconButton}
        >
          <Phone size={22} />
        </button>
        <button
          aria-label="Video call"
          title={callTitle}
          disabled={callDisabled}
          onClick={() => startCall(chat, "video")}
          className={iconButton}
        >
          <Video size={22} />
        </button>
        <button aria-label="Toggle info panel" onClick={onToggleInfo} className={iconButton}>
          <MoreVertical size={22} />
        </button>
      </div>
    </header>
  );
}