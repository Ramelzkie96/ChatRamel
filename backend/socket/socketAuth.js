import jwt from "jsonwebtoken";
import User from "../models/User.js";

// reads "a=1; token=xyz" into { a: "1", token: "xyz" }
const parseCookies = (header = "") =>
  Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const i = part.indexOf("=");
        if (i === -1) return [part, ""];
        const value = part.slice(i + 1).trim();
        try {
          return [part.slice(0, i).trim(), decodeURIComponent(value)];
        } catch {
          return [part.slice(0, i).trim(), value];
        }
      })
  );

// Runs once per connection. Reads the same httpOnly "token" cookie the REST API uses.
export default async function socketAuth(socket, next) {
  try {
    const header = socket.handshake.headers.cookie;
    if (!header) return next(new Error("Not logged in."));

    const { token } = parseCookies(header);
    if (!token) return next(new Error("Not logged in."));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name passwordChangedAt deletedAt");
    if (!user || user.deletedAt) return next(new Error("User no longer exists."));

    if (
      user.passwordChangedAt &&
      decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
    ) {
      return next(new Error("Your password was changed. Please log in again."));
    }

    socket.user = { id: user._id.toString(), name: user.name };
    next();
  } catch {
    next(new Error("Session expired. Please log in again."));
  }
}