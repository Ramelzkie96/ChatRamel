import { CATEGORIES } from "../../utils/groupCategories";

export default function CategoryPicker({ value, onChange, error }) {
  return (
    <div>
      <p className="mb-2 text-[15px] font-medium text-white">Category</p>

      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Group category">
        {CATEGORIES.map(({ id, label, icon: Icon }) => {
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm transition-colors ${
                selected
                  ? "border-accent bg-accent/15 text-blue-300"
                  : "border-line text-gray-300 hover:bg-hover hover:text-white"
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  );
}