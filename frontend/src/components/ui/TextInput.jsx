export default function TextInput({ label, icon: Icon, error, id, className = "", ...props }) {
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
        {Icon && <Icon size={20} strokeWidth={1.8} className="shrink-0 text-muted" />}
        <input
          id={inputId}
          className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-muted"
          {...props}
        />
      </div>

      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  );
}