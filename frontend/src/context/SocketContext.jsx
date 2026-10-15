import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";

export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id;
  const [socket, setSocket] = useState(null);

  // create the socket after login, destroy it on logout
  useEffect(() => {
    if (!userId) return;

    const s = io(SOCKET_URL, {
      withCredentials: true, // sends the httpOnly JWT cookie
      autoConnect: false, // connect only after the listeners below are attached
    });

    s.on("connect_error", (err) => console.warn("Socket error:", err.message));

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [userId]);

  // Child effects run before parent effects, so by the time this runs
  // every provider below has already attached its listeners (nothing is missed).
  useEffect(() => {
    if (socket) socket.connect();
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}