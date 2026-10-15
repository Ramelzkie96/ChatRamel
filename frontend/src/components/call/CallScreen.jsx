import VideoTile from "./VideoTile";
import CallControls from "./CallControls";
import CallTimer from "./CallTimer";
import useCall from "../../hooks/useCall";
import useAuth from "../../hooks/useAuth";

export default function CallScreen() {
  const { user } = useAuth();
  const { call, localStream, remoteStream, reconnecting, camOn, peerMedia } = useCall();

  const isVideo = call.type === "video";
  const hasLocalVideo = Boolean(localStream?.getVideoTracks().length);
  const hasRemoteVideo = Boolean(remoteStream?.getVideoTracks().length);

  const statusText = reconnecting
    ? "Reconnecting..."
    : call.status === "calling"
    ? "Calling..."
    : call.status === "connecting"
    ? "Connecting..."
    : null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#050914] text-white">
      <header className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-5">
        <h2 className="text-lg font-semibold">{call.peer.name}</h2>
        <p className={`text-sm ${reconnecting ? "text-amber-300" : "text-gray-300"}`}>
          {statusText ?? <CallTimer since={call.connectedAt} />}
        </p>
      </header>

      <div className="relative flex-1">
        <VideoTile
          stream={remoteStream}
          name={call.peer.name}
          avatar={call.peer.avatar}
          videoOn={isVideo && peerMedia.video && hasRemoteVideo}
          micOn={peerMedia.audio}
          avatarSize={140}
          className="h-full w-full"
        />

        {isVideo && hasLocalVideo && (
          <VideoTile
            stream={localStream}
            muted
            mirror
            name={user.name}
            avatar={user.avatar}
            videoOn={camOn}
            avatarSize={56}
            className="absolute bottom-4 right-4 aspect-video w-36 rounded-2xl border border-white/10 shadow-xl sm:w-56"
          />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <CallControls />
      </div>
    </div>
  );
}