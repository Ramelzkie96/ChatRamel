import ProfileSection from "./ProfileSection";
import ProfileActions from "./ProfileActions";
import AboutSection from "./AboutSection";
import SharedFiles from "./SharedFiles";
import MediaGrid from "./MediaGrid";
import ChatOptions from "./ChatOptions";
import LastSeen from "./LastSeen";
import GroupInfoPanel from "./group/GroupInfoPanel";
import useAuth from "../../hooks/useAuth";
import useChat from "../../hooks/useChat";
import usePresence from "../../hooks/usePresence";
import { formatLastSeen } from "../../utils/chatHelpers";
import { assetUrl } from "../../utils/api";

export default function InfoPanel({ embedded = false }) {
  const { user } = useAuth();
  const { activeChat, activeItem } = useChat();
  const { onlineIds, lastSeen } = usePresence();

  if (!activeChat || !activeItem) return null;

  const other = activeItem.other;
  const adminIds = (activeChat.admins ?? []).map((a) => a._id);

  const groupProfile = {
    cover: assetUrl(activeChat.cover),
    description: activeChat.description,
    category: activeChat.category || "",
    isAdmin: adminIds.includes(user._id),
    members: activeChat.members.map((m) => {
      const online = onlineIds.has(m._id);
      const seen = lastSeen[m._id] ?? m.lastSeen;
      return {
        id: m._id,
        name: m.name,
        avatar: m.avatar,
        status: online ? "online" : "offline",
        isYou: m._id === user._id,
        isAdmin: adminIds.includes(m._id),
        lastSeen: !online && seen ? formatLastSeen(seen) : undefined,
      };
    }),
  };

  const lastSeenValue =
    activeItem.status === "online"
      ? "Online"
      : activeItem.lastSeen
      ? formatLastSeen(activeItem.lastSeen)
      : "Offline";

  return (
    <aside
      className={
        embedded
          ? "thin-scroll h-full w-full overflow-y-auto bg-panel"
          : "thin-scroll hidden h-dvh w-[360px] shrink-0 overflow-y-auto border-l border-line bg-panel lg:block"
      }
    >
      {activeChat.isGroup ? (
        <GroupInfoPanel key={activeItem.id} chat={activeItem} profile={groupProfile} />
      ) : (
        <>
          <ProfileSection chat={activeItem} profile={{ bio: other?.bio }} />
          <ProfileActions chat={activeItem} />
          <AboutSection items={other?.email ? [{ icon: "Mail", text: other.email }] : []} />
          <SharedFiles key={`files-${activeItem.id}`} chatId={activeItem.id} />
          <MediaGrid key={`media-${activeItem.id}`} chatId={activeItem.id} />
          <ChatOptions key={activeItem.id} chat={activeItem} />
          {!activeItem.blockedByMe && <LastSeen value={lastSeenValue} />}
        </>
      )}
    </aside>
  );
}