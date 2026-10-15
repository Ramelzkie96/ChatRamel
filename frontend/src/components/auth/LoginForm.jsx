import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight, Check } from "lucide-react";
import TextInput from "../ui/TextInput";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import SocialButtons from "./SocialButtons";
import useAuth from "../../hooks/useAuth";
import { validateLogin } from "../../utils/validators";
import toast from "react-hot-toast";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const found = validateLogin(form);
  setErrors(found);
  if (Object.keys(found).length > 0) {
    toast.error("Please check the highlighted fields.", { id: "auth-toast" });
    return;
  }

  try {
    setLoading(true);
    const user = await login({ ...form, remember });
    toast.success(`Welcome back, ${user.name.split(" ")[0]}!`, { id: "auth-toast" });
    navigate("/", { replace: true });
  } catch (err) {
    toast.error(err.message || "Login failed. Please try again.", { id: "auth-toast" });
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextInput
        label="Email Address"
        name="email"
        type="email"
        icon={Mail}
        placeholder="you@example.com"
        autoComplete="email"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
      />

      <PasswordInput
        label="Password"
        name="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
      />

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-3 text-[15px] text-white">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="peer sr-only"
          />
          <span className="flex h-5 w-5 items-center justify-center rounded border border-line bg-[#0a1226] text-transparent transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white">
            <Check size={14} strokeWidth={3} />
          </span>
          Remember me
        </label>

        <a href="#" className="text-sm text-blue-400 underline-offset-2 hover:underline">
          Forgot password?
        </a>
      </div>


      <Button type="submit" loading={loading} icon={ArrowRight}>
        Login
      </Button>

      <SocialButtons />
    </form>
  );
}