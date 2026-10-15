import IncomingCallModal from "./IncomingCallModal";
import CallScreen from "./CallScreen";
import useCall from "../../hooks/useCall";

// shows the right screen for whatever the call is doing right now
export default function CallLayer() {
  const { call } = useCall();

  if (!call) return null;
  if (call.direction === "incoming" && call.status === "ringing") return <IncomingCallModal />;
  return <CallScreen />;
}