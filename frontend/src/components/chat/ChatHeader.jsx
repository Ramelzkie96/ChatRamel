import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import Avatar from "../ui/Avatar";
import GroupIcon from "../groups/GroupIcon";
import useCall from "../../hooks/useCall";
import { formatLastSeen } from "../../utils/chatHelpers";
import { getCategory } from "../../utils/groupCategories";

const firstName = (n = "") => n.split(" ")[0];

export default function ChatHeader({ chat, typingNames = [], onToggleInfo }) {
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
    "transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-gray-300";

  return (
    <header className="flex items-center justify-between border-b border-line px-6 py-4">
      <div className="flex items-center gap-4">
        <button aria-label="Back" className="text-gray-300 transition-colors hover:text-white">
          <ArrowLeft size={22} />
        </button>

        {chat.isGroup ? (
          <GroupIcon src={chat.avatar} category={chat.category} name={chat.name} size={46} />
        ) : (
          <Avatar name={chat.name} src={chat.avatar} status={chat.status} size={46} />
        )}

        <div>
          <h2 className="text-[17px] font-semibold leading-tight">{chat.name}</h2>
          <p
            className={`flex items-center gap-1.5 text-sm ${
              typing ? "text-blue-400" : "text-muted"
            }`}
          >
            {!typing && chat.status === "online" && (
              <span className="h-2 w-2 rounded-full bg-green-500" />
            )}
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 text-gray-300">
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
        <button
          aria-label="Toggle info panel"
          onClick={onToggleInfo}
          className="transition-colors hover:text-white"
        >
          <MoreVertical size={22} />
        </button>
      </div>
    </header>
  );
}