import { Zap, X } from "lucide-react";

export default function SidebarHeader({ onClose }) {
  return (
    <div className="flex items-center gap-3 px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent shadow-lg shadow-blue-500/30">
        <Zap size={24} className="text-white" fill="white" />
      </div>
      <div className="min-w-0">
        <h1 className="text-xl font-bold leading-tight">
          Ramel<span className="text-blue-500">Chat</span>
        </h1>
        <p className="truncate text-[11px] text-muted">Connect • Chat • Together</p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="ml-auto rounded-lg p-2 text-muted transition-colors hover:bg-hover hover:text-white md:hidden"
        >
          <X size={22} />
        </button>
      )}
    </div>
  );
}