import { Zap } from "lucide-react";

export default function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 px-6 pb-5 pt-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent shadow-lg shadow-blue-500/30">
        <Zap size={24} className="text-white" fill="white" />
      </div>
      <div>
        <h1 className="text-xl font-bold leading-tight">
          Ramel<span className="text-blue-500">Chat</span>
        </h1>
        <p className="text-[11px] text-muted">Connect • Chat • Together</p>
      </div>
    </div>
  );
}