export const isValidEmail = (email = "") => /^\S+@\S+\.\S+$/.test(email.trim());

export function validateSignup({ name, email, password }) {
  if (!name?.trim()) return "Full name is required.";
  if (!email?.trim()) return "Email is required.";
  if (!isValidEmail(email)) return "Enter a valid email address.";
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null;
}

export function validateLogin({ email, password }) {
  if (!email?.trim()) return "Email is required.";
  if (!isValidEmail(email)) return "Enter a valid email address.";
  if (!password) return "Password is required.";
  return null;
}

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const RESERVED_USERNAMES = new Set(["admin", "administrator", "support", "chatramel", "system", "root"]);

// value must already be trimmed and lowercased; returns an error message or null
export function validateUsername(value = "") {
  if (!value) return "Username is required.";
  if (!USERNAME_RE.test(value)) {
    return "Username must be 3-20 characters: lowercase letters, numbers and underscores.";
  }
  if (RESERVED_USERNAMES.has(value)) return "That username isn't available.";
  return null;
}

export function validateNewPassword(password = "") {
  if (!password) return "New password is required.";
  if (password.length < 6) return "New password must be at least 6 characters.";
  if (password.length > 72) return "Password is too long (72 characters max).";
  return null;
}