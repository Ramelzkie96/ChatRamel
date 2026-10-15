import { Phone, Video, PhoneOff } from "lucide-react";
import Avatar from "../ui/Avatar";
import useCall from "../../hooks/useCall";

export default function IncomingCallModal() {
  const { call, acceptCall, hangUp } = useCall();
  const isVideo = call.type === "video";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div
        role="alertdialog"
        aria-label={`Incoming call from ${call.peer.name}`}
        className="w-full max-w-sm rounded-3xl border border-line bg-panel p-8 text-center shadow-2xl"
      >
        <div className="relative mx-auto h-28 w-28">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/30" />
          <div className="relative">
            <Avatar name={call.peer.name} src={call.peer.avatar} size={112} />
          </div>
        </div>

        <h2 className="mt-6 text-xl font-semibold">{call.peer.name}</h2>
        <p className="mt-1 text-sm text-muted">
          Incoming {isVideo ? "video" : "voice"} call...
        </p>

        <div className="mt-8 flex justify-center gap-12">
          <button type="button" onClick={hangUp} className="group flex flex-col items-center gap-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-500/30 transition-colors group-hover:bg-red-500">
              <PhoneOff size={24} />
            </span>
            <span className="text-sm text-gray-300">Decline</span>
          </button>

          <button type="button" onClick={acceptCall} className="group flex flex-col items-center gap-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-500/30 transition-colors group-hover:bg-green-500">
              {isVideo ? <Video size={24} /> : <Phone size={24} />}
            </span>
            <span className="text-sm text-gray-300">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}