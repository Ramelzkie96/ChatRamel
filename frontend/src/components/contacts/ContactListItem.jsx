import { Phone, Video, Star } from "lucide-react";
import Avatar from "../ui/Avatar";
import ContactMenu from "./ContactMenu";
import useCall from "../../hooks/useCall";
import { formatLastSeen } from "../../utils/chatHelpers";

export default function ContactListItem({ item, active, actions, onOpen }) {
  const { inCall } = useCall();
  const { user, favorite, status, lastSeen } = item;
  const online = status === "online";

  const line = online ? "Online" : lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : "Offline";

  const hoverButton =
    "rounded-lg p-1.5 text-muted transition-colors hover:bg-hover hover:text-white disabled:cursor-not-allowed disabled:opacity-40";

  return (
    // a div, because buttons can't be nested inside a button
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(user)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return; // ignore keys pressed inside the menu or a modal
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(user);
        }
      }}
      className={`group flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
        active ? "bg-accent/30" : "hover:bg-hover"
      }`}
    >
      <Avatar name={user.name} src={user.avatar} status={status} size={46} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{user.name}</p>
        <p className={`truncate text-sm ${online ? "text-green-400" : "text-muted"}`}>{line}</p>
      </div>

      {favorite && <Star size={15} className="shrink-0 fill-amber-400 text-amber-400" />}

      <div
        className="flex shrink-0 items-center gap-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label={`Voice call ${user.name}`}
          disabled={inCall}
          onClick={() => actions.call(user, "audio")}
          className={`${hoverButton} opacity-0 focus:opacity-100 group-hover:opacity-100`}
        >
          <Phone size={17} />
        </button>
        <button
          type="button"
          aria-label={`Video call ${user.name}`}
          disabled={inCall}
          onClick={() => actions.call(user, "video")}
          className={`${hoverButton} opacity-0 focus:opacity-100 group-hover:opacity-100`}
        >
          <Video size={17} />
        </button>
        <ContactMenu item={item} actions={actions} />
      </div>
    </div>
  );
}