import { Zap, Users, ShieldCheck } from "lucide-react";
import Logo from "../ui/Logo";
import FeatureItem from "./FeatureItem";

const features = [
  { icon: Zap, title: "Real-time messaging", subtitle: "Instantly connect with others" },
  { icon: Users, title: "Group chats", subtitle: "Chat with your friends or team" },
  { icon: ShieldCheck, title: "Secure & private", subtitle: "Your conversations, your control" },
];

export default function BrandPanel() {
  return (
    <div className="relative hidden w-1/2 flex-col justify-center overflow-hidden bg-gradient-to-br from-[#0b1a4d] via-[#0a1535] to-app px-16 py-12 lg:flex">
      <Logo size={72} textClass="text-6xl" />

      <h2 className="mt-6 text-4xl font-medium text-gray-300">Connect. Chat. Be Closer.</h2>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-gray-400">
        ChatRamel lets you stay in touch with your friends, family, and team — anytime, anywhere.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        {features.map((f) => (
          <FeatureItem key={f.title} {...f} />
        ))}
      </div>

      {/* Put your mockup image at public/auth-preview.png. It hides itself if missing. */}
      <img
        src="/auth-preview.png"
        alt="ChatRamel on tablet and phone"
        onError={(e) => (e.currentTarget.style.display = "none")}
        className="mt-10 w-full max-w-xl select-none"
        draggable={false}
      />
    </div>
  );
}