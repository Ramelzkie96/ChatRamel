import { useNavigate } from "react-router-dom";
import Logo from "../ui/Logo";
import AuthTabs from "./AuthTabs";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const COPY = {
  login: {
    title: "Welcome back!",
    subtitle: "Login to your account to continue chatting.",
    footerText: "Don't have an account?",
    footerLink: "Sign up",
    footerTo: "signup",
  },
  signup: {
    title: "Create your account",
    subtitle: "Sign up to start chatting with your friends.",
    footerText: "Already have an account?",
    footerLink: "Login",
    footerTo: "login",
  },
};

export default function AuthCard({ mode }) {
  const navigate = useNavigate();
  const copy = COPY[mode];

  const goTo = (target) => navigate(`/${target}`);

  return (
    <div className="w-full max-w-[540px] rounded-3xl border border-line bg-panel/80 p-8 shadow-2xl shadow-black/40 sm:p-10">
      <div className="flex justify-center">
        <Logo size={44} textClass="text-3xl" />
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold">{copy.title}</h2>
        <p className="mt-2 text-[15px] text-gray-300">{copy.subtitle}</p>
      </div>

      <div className="mt-8">
        <AuthTabs mode={mode} onChange={goTo} />
      </div>

      <div className="mt-6">{mode === "login" ? <LoginForm /> : <SignupForm />}</div>

      <p className="mt-6 text-center text-[15px] text-gray-300">
        {copy.footerText}{" "}
        <button
          type="button"
          onClick={() => goTo(copy.footerTo)}
          className="text-blue-400 underline-offset-2 hover:underline"
        >
          {copy.footerLink}
        </button>
      </p>
    </div>
  );
}