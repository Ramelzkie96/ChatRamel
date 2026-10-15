import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

// returns the socket, or null before it exists
export default function useSocket() {
  return useContext(SocketContext);
}