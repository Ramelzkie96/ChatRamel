export const isValidEmail = (email = "") => /^\S+@\S+\.\S+$/.test(email.trim());

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";
  return errors;
}

export function validateSignup({ name, email, password, confirmPassword }) {
  const errors = {};
  if (!name.trim()) errors.name = "Full name is required.";

  if (!email.trim()) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters.";

  if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";

  return errors;
}

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export function validateProfile({ name, username, bio }, { hadUsername = false } = {}) {
  const errors = {};

  if (!name.trim()) errors.name = "Full name is required.";
  else if (name.trim().length > 60) errors.name = "Name is too long (60 characters max).";

  const u = username.trim().toLowerCase();
  if (!u) {
    if (hadUsername) errors.username = "Username can't be empty.";
  } else if (!USERNAME_RE.test(u)) {
    errors.username = "3-20 characters: lowercase letters, numbers and underscores.";
  }

  if (bio.trim().length > 150) errors.bio = "Bio is too long (150 characters max).";

  return errors;
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  const errors = {};

  if (!currentPassword) errors.currentPassword = "Enter your current password.";

  if (!newPassword) errors.newPassword = "Enter a new password.";
  else if (newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters.";
  else if (newPassword.length > 72) errors.newPassword = "Password is too long (72 characters max).";
  else if (newPassword === currentPassword) {
    errors.newPassword = "Your new password must be different.";
  }

  if (!confirmPassword) errors.confirmPassword = "Please confirm your new password.";
  else if (confirmPassword !== newPassword) errors.confirmPassword = "Passwords do not match.";

  return errors;
}