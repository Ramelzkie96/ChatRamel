import { useEffect, useRef } from "react";
import { MicOff } from "lucide-react";
import Avatar from "../ui/Avatar";

// One <video> with an avatar on top when the camera is off.
// The <video> stays mounted even then, because that is also what plays the other person's voice.
export default function VideoTile({
  stream,
  muted = false, // true for your own preview (avoids echo)
  mirror = false,
  name,
  avatar,
  videoOn,
  micOn = true,
  avatarSize = 120,
  className = "",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.srcObject !== (stream ?? null)) el.srcObject = stream ?? null;
  }, [stream]);

  return (
    <div className={`relative overflow-hidden bg-[#0a1226] ${className}`}>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full w-full object-cover ${mirror ? "-scale-x-100" : ""} ${
          videoOn ? "" : "invisible"
        }`}
      />

      {!videoOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a1226]">
          <Avatar name={name} src={avatar} size={avatarSize} />
        </div>
      )}

      {!micOn && (
        <span
          title="Muted"
          className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
        >
          <MicOff size={15} />
        </span>
      )}
    </div>
  );
}