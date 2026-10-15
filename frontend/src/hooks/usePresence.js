import { useContext } from "react";
import { PresenceContext } from "../context/PresenceContext";

export default function usePresence() {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error("usePresence must be used inside <PresenceProvider>");
  return ctx;
}