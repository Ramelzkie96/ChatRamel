import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../ui/Avatar";
import useAuth from "../../hooks/useAuth";

export default function UserFooter() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex items-center gap-3 border-t border-line px-5 py-4">
      <Avatar name={user.name} src={user.avatar} status="online" size={44} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{user.name}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Online
        </p>
      </div>

      <button
        onClick={handleLogout}
        aria-label="Log out"
        title="Log out"
        className="rounded-lg p-2 text-muted transition-colors hover:bg-hover hover:text-red-400"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
}