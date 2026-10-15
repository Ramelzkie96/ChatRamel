import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ label, error, id, className = "", ...props }) {
  const [visible, setVisible] = useState(false);
  const inputId = id || props.name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-[15px] font-medium text-white">
          {label}
        </label>
      )}

      <div
        className={`flex items-center gap-3 rounded-xl border bg-[#0a1226] px-4 py-3.5 transition-colors focus-within:border-accent ${
          error ? "border-red-500" : "border-line"
        }`}
      >
        <Lock size={20} strokeWidth={1.8} className="shrink-0 text-muted" />
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-muted"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="shrink-0 text-muted transition-colors hover:text-white"
        >
          {visible ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>

      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  );
}