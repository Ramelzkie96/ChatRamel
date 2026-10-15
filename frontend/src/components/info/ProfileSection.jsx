import Avatar from "../ui/Avatar";

export default function ProfileSection({ chat, profile }) {
  const subtitle = chat.blockedByMe
    ? "Blocked"
    : chat.status === "online"
    ? "Online"
    : chat.status === "busy"
    ? "Busy"
    : "Offline";

  return (
    <div className="flex flex-col items-center px-6 pb-2 pt-8 text-center">
      <Avatar name={chat.name} src={chat.avatar} status={chat.status} size={104} />
      <h2 className="mt-4 text-xl font-semibold">{chat.name}</h2>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
      {profile.bio && <p className="mt-2 text-sm text-gray-300">{profile.bio}</p>}
    </div>
  );
}