const TABS = [
  { id: "login", label: "Login" },
  { id: "signup", label: "Sign Up" },
];

export default function AuthTabs({ mode, onChange }) {
  return (
    <div className="grid grid-cols-2 rounded-xl border border-line bg-[#0a1226] p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-lg py-3 text-base font-semibold transition-colors ${
            mode === tab.id
              ? "bg-accent text-white shadow-lg shadow-blue-500/25"
              : "text-gray-300 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}