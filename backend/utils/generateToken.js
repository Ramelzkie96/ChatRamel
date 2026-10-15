import jwt from "jsonwebtoken";

const DAY = 24 * 60 * 60 * 1000;

export default function generateToken(res, userId, remember = false) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: remember ? "30d" : "1d",
  });

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true, // JavaScript can't read it
    secure: isProd, // https only in production
    sameSite: isProd ? "none" : "lax",
    // remember me = 30 days, otherwise it ends when the browser closes
    ...(remember ? { maxAge: 30 * DAY } : {}),
  });
}