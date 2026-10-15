import Avatar from "../../ui/Avatar";
import MemberMenu from "./MemberMenu";

export default function MemberItem({ member, viewerIsAdmin, onMessage, onSetRole, onRemove }) {
  const online = member.status === "online";

  const presence = online
    ? "Online"
    : member.lastSeen
    ? `Offline • ${member.lastSeen}`
    : "Offline";

  // "Admin" while they're online, "Admin • Offline • 2h ago" otherwise
  const line = member.isAdmin ? (online ? "Admin" : `Admin • ${presence}`) : presence;

  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar name={member.name} src={member.avatar} size={44} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium">
          {member.name}
          {member.isYou && <span className="font-normal text-muted"> (You)</span>}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <span className={`h-2 w-2 shrink-0 rounded-full ${online ? "bg-green-500" : "bg-gray-500"}`} />
          <span className="truncate">{line}</span>
        </p>
      </div>

      <MemberMenu
        member={member}
        viewerIsAdmin={viewerIsAdmin}
        onMessage={onMessage}
        onSetRole={onSetRole}
        onRemove={onRemove}
      />
    </div>
  );
}