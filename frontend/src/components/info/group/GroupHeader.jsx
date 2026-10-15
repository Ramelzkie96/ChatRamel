import { Loader2 } from "lucide-react";
import GroupIcon from "../../groups/GroupIcon";
import { getCategory } from "../../../utils/groupCategories";

export default function GroupHeader({
  name,
  src,
  category,
  memberCount,
  description,
  uploading,
  canEdit,
  onEdit,
}) {
  const categoryLabel = getCategory(category)?.label;

  return (
    <div className="flex flex-col items-center px-6 pt-8">
      <div className="relative">
        <GroupIcon src={src} category={category} name={name} size={84} />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="animate-spin text-white" size={24} />
          </div>
        )}
      </div>

      <h2 className="mt-4 max-w-full truncate text-xl font-semibold">{name}</h2>
      <p className="mt-1 text-sm text-muted">
        {memberCount} members{categoryLabel ? ` • ${categoryLabel}` : ""}
      </p>

      {description ? (
        <p className="mt-4 w-full text-left text-[15px] leading-snug text-gray-200">{description}</p>
      ) : (
        canEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="mt-4 w-full text-left text-[15px] text-muted transition-colors hover:text-white"
          >
            Add a group description
          </button>
        )
      )}
    </div>
  );
}