import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import BlockedBanner from "./BlockedBanner";
import EmptyChat from "./EmptyChat";
import useChat from "../../hooks/useChat";
import useMessages from "../../hooks/useMessages";
import useChatActions from "../../hooks/useChatActions";
import { useTypingEmitter } from "../../hooks/useTyping";

export default function ChatWindow({ onToggleInfo, onOpenMenu }) {
  const { activeItem } = useChat();
  const { messages, loading, send, sendImage, sendFile, react } = useMessages(activeItem?.id);
  const { notifyTyping, stopTyping } = useTypingEmitter(activeItem?.id);
  const actions = useChatActions(activeItem?.id, activeItem?.other?._id, activeItem?.name);

  if (!activeItem) {
    return (
      <main className="flex flex-1 bg-app">
        <EmptyChat />
      </main>
    );
  }

  const typingNames = activeItem.typingNames ?? [];

  const handleSend = async (text) => {
    stopTyping();
    await send(text);
  };

  const handleSendImage = async (file, caption) => {
    stopTyping();
    await sendImage(file, caption);
  };

  const handleSendFile = async (file, caption) => {
    stopTyping();
    await sendFile(file, caption);
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-app">
      <ChatHeader chat={activeItem} typingNames={typingNames} onToggleInfo={onToggleInfo} onOpenMenu={onOpenMenu}/>
      <MessageList
        chat={activeItem}
        messages={messages}
        loading={loading}
        typingNames={typingNames}
        // the react button is hidden for someone you blocked (the server enforces it too)
        onReact={activeItem.blockedByMe ? undefined : react}
      />

      {activeItem.blockedByMe ? (
        <BlockedBanner name={activeItem.name} onUnblock={actions.unblock} />
      ) : (
        <MessageInput
          onSend={handleSend}
          onSendImage={handleSendImage}
          onSendFile={handleSendFile}
          onTyping={notifyTyping}
        />
      )}
    </main>
  );
}