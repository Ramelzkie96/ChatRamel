import { UserPlus } from "lucide-react";

export default function AddMemberButton({ onClick }) {
  return (
    <div className="px-5 pt-4">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent bg-accent/10 py-2.5 text-[15px] font-medium text-blue-400 transition-colors hover:bg-accent/25"
      >
        <UserPlus size={18} />
        Add Member
      </button>
    </div>
  );
}