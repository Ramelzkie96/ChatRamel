import { MessageCircle } from "lucide-react";

export default function EmptyChat() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-hover">
        <MessageCircle size={36} />
      </div>
      <h2 className="text-lg font-semibold text-gray-200">Select a chat</h2>
      <p className="text-sm">Pick a conversation from the sidebar to start messaging.</p>
    </div>
  );
}