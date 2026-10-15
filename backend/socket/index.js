import { Server } from "socket.io";
import User from "../models/User.js";
import socketAuth from "./socketAuth.js";
import typingHandlers from "./typingHandlers.js";
import messageHandlers from "./messageHandlers.js";
import callHandlers, { cleanupSocketCalls } from "./callHandlers.js";
import { addSocket, removeSocket, getOnlineIds } from "./presence.js";
import { setIO, broadcast } from "./emitters.js";

export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  setIO(io);
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const userId = socket.user.id;

    // register listeners first so no early event is missed
    typingHandlers(socket);
    messageHandlers(socket);
    callHandlers(socket);

    socket.join(`user:${userId}`);
    const cameOnline = addSocket(userId, socket.id);

    // tell the new connection who is online right now
    socket.emit("presence:init", getOnlineIds());

    if (cameOnline) {
      try {
        await User.findByIdAndUpdate(userId, { status: "online" });
        broadcast("presence:update", { userId, status: "online" });
      } catch (err) {
        console.error("presence error:", err.message);
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`🔌 ${socket.user.name} connected (${socket.id})`);
    }

    socket.on("disconnect", async () => {
      const wentOffline = removeSocket(userId, socket.id);

      // hang up or cancel any call this connection was part of
      cleanupSocketCalls(socket, wentOffline);

      if (process.env.NODE_ENV === "development") {
        console.log(`🔌 ${socket.user.name} disconnected`);
      }

      if (!wentOffline) return; // still has another tab open

      try {
        const lastSeen = new Date();
        await User.findByIdAndUpdate(userId, { status: "offline", lastSeen });
        broadcast("presence:update", { userId, status: "offline", lastSeen });
      } catch (err) {
        console.error("presence error:", err.message);
      }
    });
  });

  return io;
}