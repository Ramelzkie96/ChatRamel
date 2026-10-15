import { useState } from "react";
import Avatar from "../ui/Avatar";
import MessageStatus from "./MessageStatus";
import ImageViewer from "./ImageViewer";
import FileCard from "./FileCard";
import ReactionPicker from "./ReactionPicker";
import ReactionBar from "./ReactionBar";
import ReactionDetailsModal from "./ReactionDetailsModal";
import useAuth from "../../hooks/useAuth";
import { formatClock } from "../../utils/chatHelpers";
import { assetUrl } from "../../utils/api";

// onReact(messageId, emoji) is left out when reacting isn't allowed (you blocked this person)
export default function MessageBubble({ message, chat, onMediaLoad, onReact }) {
  const { user } = useAuth();
  const [viewing, setViewing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  const [details, setDetails] = useState(null); // null, "all" or an emoji (which tab to open)

  // "Ramel added Jessa", "Jessa left the group", "Video call • 5:23"...
  if (message.type === "system") {
    return (
      <div className="flex justify-center">
        <span className="max-w-[80%] rounded-full bg-hover px-4 py-1.5 text-center text-xs text-muted">
          {message.text}
        </span>
      </div>
    );
  }

  const sender = message.sender || {};
  const isMine = sender._id === user._id;
  const seen = message.seenBy?.some((id) => id !== user._id);
  const hasImage = Boolean(message.image);
  const hasFile = Boolean(message.file?.url);
  const hasAttachment = hasImage || hasFile;
  const src = assetUrl(message.image);

  const reactions = message.reactions ?? [];
  const myEmoji = reactions.find((r) => r.user?._id === user._id)?.emoji;
  const react = onReact ? (emoji) => onReact(message._id, emoji) : undefined;

  return (
    <div className={`flex items-start gap-2 sm:gap-3 ${isMine ? "justify-end" : "justify-start"}`}>
      {!isMine && <Avatar name={sender.name} src={sender.avatar} size={40} />}

        <div className={`flex min-w-0 max-w-[85%] flex-col sm:max-w-[65%] ${isMine ? "items-end" : "items-start"}`}>
        {chat.isGroup && !isMine && (
          <span className="mb-1 text-sm font-medium text-blue-400">{sender.name}</span>
        )}

        {/* "group" makes the react button appear while the mouse is over the message */}
        <div className={`group flex max-w-full items-center gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
          <div
            className={`min-w-0 overflow-hidden whitespace-pre-wrap break-words rounded-2xl text-[15px] leading-snug ${
              hasAttachment ? "p-1.5" : "px-4 py-3"
            } ${
              isMine
                ? "rounded-br-md bg-blue-600 text-white"
                : "rounded-bl-md bg-[#16203d] text-gray-100"
            }`}
          >
            {hasImage &&
              (broken ? (
                <div className="flex h-32 w-52 items-center justify-center rounded-xl bg-black/20 text-xs text-gray-300">
                  Image unavailable
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewing(true)}
                  aria-label="Open image"
                  className={`block cursor-zoom-in rounded-xl bg-black/20 ${
                    loaded ? "" : "h-40 w-56"
                  }`}
                >
                  <img
                    src={src}
                    alt={message.text || "Shared photo"}
                    onLoad={() => {
                      setLoaded(true);
                      onMediaLoad?.();
                    }}
                    onError={() => setBroken(true)}
                    className="max-h-72 max-w-full rounded-xl object-cover"
                    draggable={false}
                  />
                </button>
              ))}

            {hasFile && <FileCard file={message.file} chatId={chat.id} messageId={message._id} />}

            {message.text && (
              <p className={hasAttachment ? "px-2.5 pb-1 pt-2" : ""}>{message.text}</p>
            )}
          </div>

          {react && <ReactionPicker myEmoji={myEmoji} onPick={react} />}
        </div>

        <ReactionBar
          reactions={reactions}
          myId={user._id}
          isMine={isMine}
          onToggle={react}
          onShowDetails={setDetails}
        />

        <MessageStatus time={formatClock(message.createdAt)} isMine={isMine} seen={seen} />
      </div>

      {viewing && <ImageViewer src={src} onClose={() => setViewing(false)} />}

      {details !== null && (
        <ReactionDetailsModal
          reactions={reactions}
          myId={user._id}
          initialTab={details}
          onClose={() => setDetails(null)}
        />
      )}
    </div>
  );
}