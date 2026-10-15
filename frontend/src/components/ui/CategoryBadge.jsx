import { getCategory } from "../../utils/groupCategories";

export default function CategoryBadge({ id, className = "" }) {
  const category = getCategory(id);
  if (!category) return null;

  const Icon = category.icon;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${category.badge} ${className}`}
    >
      <Icon size={11} />
      {category.label}
    </span>
  );
}