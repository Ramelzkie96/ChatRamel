import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, ArrowRight } from "lucide-react";
import TextInput from "../ui/TextInput";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import SocialButtons from "./SocialButtons";
import useAuth from "../../hooks/useAuth";
import { validateSignup } from "../../utils/validators";
import toast from "react-hot-toast";

export default function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = validateSignup(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Please check the highlighted fields.", { id: "auth-toast" });
      return;
    }

    try {
      setLoading(true);
      const user = await signup(form);
      toast.success(`Account created! Welcome, ${user.name.split(" ")[0]} 🎉`, { id: "auth-toast" });
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.message || "Sign up failed. Please try again.", { id: "auth-toast" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <TextInput
        label="Full Name"
        name="name"
        icon={User}
        placeholder="Ramel Gulane"
        autoComplete="name"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
      />

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
        placeholder="At least 6 characters"
        autoComplete="new-password"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
      />

      <PasswordInput
        label="Confirm Password"
        name="confirmPassword"
        placeholder="Re-enter your password"
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />

      <Button type="submit" loading={loading} icon={ArrowRight}>
        Create Account
      </Button>

      <SocialButtons />
    </form>
  );
}