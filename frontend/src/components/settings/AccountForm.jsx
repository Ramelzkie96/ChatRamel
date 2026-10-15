import { useState } from "react";
import { User, AtSign, Mail, Save } from "lucide-react";
import TextInput from "../ui/TextInput";
import Button from "../ui/Button";
import { validateProfile } from "../../utils/validators";

const MAX_BIO = 150;

export default function AccountForm({ user, onSave, onChangeEmail }) {
  const initial = {
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
  };

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const normalized = {
    name: form.name.trim(),
    username: form.username.trim().toLowerCase(),
    bio: form.bio.trim(),
  };

  const dirty =
    normalized.name !== initial.name ||
    normalized.username !== initial.username ||
    normalized.bio !== initial.bio;

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const found = validateProfile(form, { hadUsername: Boolean(user.username) });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // only send what actually changed
    const changes = {};
    if (normalized.name !== initial.name) changes.name = normalized.name;
    if (normalized.username !== initial.username) changes.username = normalized.username;
    if (normalized.bio !== initial.bio) changes.bio = normalized.bio;

    setLoading(true);
    await onSave(changes);
    setLoading(false);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <TextInput
        label="Full Name"
        name="name"
        icon={User}
        maxLength={60}
        autoComplete="name"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
      />

      <div>
        <TextInput
          label="Username"
          name="username"
          icon={AtSign}
          maxLength={20}
          autoComplete="username"
          placeholder="Choose a username"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
        />
        {!errors.username && (
          <p className="mt-1.5 text-xs text-muted">
            This is your unique username for others to find you.
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-[15px] font-medium text-white">Email Address</p>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-[#0a1226] px-4 py-3.5">
          <Mail size={20} strokeWidth={1.8} className="shrink-0 text-muted" />
          <span className="min-w-0 flex-1 truncate text-[15px] text-gray-200">{user.email}</span>
          <button
            type="button"
            onClick={onChangeEmail}
            className="shrink-0 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            Change
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="mb-2 block text-[15px] font-medium text-white">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={MAX_BIO}
          value={form.bio}
          onChange={handleChange}
          placeholder="Tell people a little about yourself."
          className={`w-full resize-none rounded-xl border bg-[#0a1226] px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-muted focus:border-accent ${
            errors.bio ? "border-red-500" : "border-line"
          }`}
        />
        <div className="mt-1 flex justify-between text-xs">
          <span className="text-red-400">{errors.bio}</span>
          <span className="text-muted">
            {form.bio.length}/{MAX_BIO}
          </span>
        </div>
      </div>

      <Button type="submit" loading={loading} disabled={!dirty} icon={Save}>
        Save Changes
      </Button>
    </form>
  );
}