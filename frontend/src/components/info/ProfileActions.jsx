import { Phone, Video, MoreHorizontal } from "lucide-react";
import useCall from "../../hooks/useCall";

export default function ProfileActions({ chat }) {
  const { startCall, inCall } = useCall();
  const callDisabled = chat.blockedByMe || inCall;

  const actions = [
    { id: "call", label: "Call", icon: Phone, onClick: () => startCall(chat, "audio"), disabled: callDisabled },
    { id: "video", label: "Video", icon: Video, onClick: () => startCall(chat, "video"), disabled: callDisabled },
    { id: "more", label: "More", icon: MoreHorizontal },
  ];

  return (
    <div className="flex justify-center gap-8 px-6 py-5">
      {actions.map(({ id, label, icon: Icon, onClick, disabled }) => (
        <button
          key={id}
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="group flex flex-col items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-hover text-gray-200 transition-colors group-enabled:group-hover:bg-accent group-enabled:group-hover:text-white">
            <Icon size={20} />
          </span>
          <span className="text-sm text-gray-300">{label}</span>
        </button>
      ))}
    </div>
  );
}