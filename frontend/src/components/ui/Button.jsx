import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-accent text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500",
  outline: "border border-line bg-[#0a1226] text-white hover:bg-hover",
  danger: "bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-500",
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  ...props
}) {
  return (
    <button
      disabled={loading || disabled}
      className={`flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <>
          {children}
          {Icon && <Icon size={20} />}
        </>
      )}
    </button>
  );
}