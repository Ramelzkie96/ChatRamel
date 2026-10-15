import { Fragment, useRef } from "react";
import { Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import DateDivider from "./DateDivider";
import TypingIndicator from "./TypingIndicator";
import useAutoScroll from "../../hooks/useAutoScroll";
import { formatDayLabel } from "../../utils/chatHelpers";

export default function MessageList({ chat, messages, loading, typingNames = [], onReact }) {
  const bottomRef = useAutoScroll(`${chat.id}-${messages.length}-${typingNames.length}`);
  const containerRef = useRef(null);

  // an image just finished loading and made the list taller
  const handleMediaLoad = () => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 600) bottomRef.current?.scrollIntoView({ behavior: "auto" });
  };

  return (
    <div ref={containerRef} className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-8">
      {loading && (
        <div className="flex justify-center py-10 text-muted">
          <Loader2 className="animate-spin" size={26} />
        </div>
      )}

      {!loading && messages.length === 0 && (
        <p className="py-10 text-center text-sm text-muted">No messages yet. Say hi 👋</p>
      )}

      <div className="flex flex-col gap-5">
        {messages.map((msg, i) => {
          const label = formatDayLabel(msg.createdAt);
          const showDivider = i === 0 || label !== formatDayLabel(messages[i - 1].createdAt);

          return (
            <Fragment key={msg._id}>
              {showDivider && <DateDivider label={label} />}
              <MessageBubble
                message={msg}
                chat={chat}
                onMediaLoad={handleMediaLoad}
                onReact={onReact}
              />
            </Fragment>
          );
        })}

        <TypingIndicator chat={chat} names={typingNames} />
      </div>

      <div ref={bottomRef} />
    </div>
  );
}