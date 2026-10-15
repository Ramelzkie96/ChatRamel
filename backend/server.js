import "dotenv/config";
import http from "http";
import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import initSocket from "./socket/index.js";
import { UPLOAD_ROOT } from "./middleware/uploadMiddleware.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import reportRoutes from "./routes/reportRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Public images only (names are random and unique, so long caching is safe).
// Documents live in uploads/files and are NOT served here: they download through
// GET /api/messages/:chatId/files/:messageId, which checks chat membership.
const imageStatic = {
  maxAge: "7d",
  setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
};
app.use("/uploads/covers", express.static(path.join(UPLOAD_ROOT, "covers"), imageStatic));
app.use("/uploads/messages", express.static(path.join(UPLOAD_ROOT, "messages"), imageStatic));
app.use("/uploads/avatars", express.static(path.join(UPLOAD_ROOT, "avatars"), imageStatic));

app.get("/api/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    database: states[mongoose.connection.readyState],
    dbName: mongoose.connection.name,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/account", accountRoutes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // a crash or restart can leave people stuck as "online", so reset everyone
  await User.updateMany({ status: { $ne: "offline" } }, { status: "offline" });

  server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});