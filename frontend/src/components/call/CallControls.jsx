import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import useCall from "../../hooks/useCall";

function RoundButton({ onClick, label, active = true, disabled, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-500"
          : active
          ? "bg-white/15 text-white hover:bg-white/25"
          : "bg-white text-[#050914] hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

export default function CallControls() {
  const { call, micOn, camOn, canToggleCamera, toggleMic, toggleCam, hangUp } = useCall();

  return (
    <div className="flex items-center justify-center gap-5 bg-gradient-to-t from-black/70 to-transparent px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6">
      <RoundButton
        onClick={toggleMic}
        active={micOn}
        label={micOn ? "Mute microphone" : "Unmute microphone"}
      >
        {micOn ? <Mic size={24} /> : <MicOff size={24} />}
      </RoundButton>

      {call.type === "video" && (
        <RoundButton
          onClick={toggleCam}
          active={camOn}
          disabled={!canToggleCamera}
          label={camOn ? "Turn camera off" : "Turn camera on"}
        >
          {camOn ? <Video size={24} /> : <VideoOff size={24} />}
        </RoundButton>
      )}

      <RoundButton onClick={hangUp} danger label="Hang up">
        <PhoneOff size={24} />
      </RoundButton>
    </div>
  );
}