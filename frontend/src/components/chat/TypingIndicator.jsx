import Avatar from "../ui/Avatar";

const firstName = (n = "") => n.split(" ")[0];

export default function TypingIndicator({ chat, names = [] }) {
  if (names.length === 0) return null;

  const label =
    names.length === 1
      ? `${firstName(names[0])} is typing...`
      : `${names.map(firstName).join(", ")} are typing...`;

  return (
    <div className="flex items-start gap-3">
      <Avatar name={names[0]} src={chat.isGroup ? undefined : chat.avatar} size={40} />

      <div>
        <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-[#16203d] px-4 py-3.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}