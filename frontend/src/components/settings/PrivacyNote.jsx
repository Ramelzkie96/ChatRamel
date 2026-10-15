import { ShieldCheck } from "lucide-react";

export default function PrivacyNote() {
  return (
    <section className="flex flex-col items-center rounded-2xl border border-line bg-panel px-6 py-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-blue-400">
        <ShieldCheck size={28} />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold text-blue-400">Your privacy matters</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        We're committed to keeping your account safe and secure.
      </p>
    </section>
  );
}