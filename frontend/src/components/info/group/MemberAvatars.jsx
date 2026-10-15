import Avatar from "../../ui/Avatar";

const MAX = 4;

export default function MemberAvatars({ members = [] }) {
  const shown = members.slice(0, MAX);
  const extra = members.length - shown.length;

  return (
    <div className="flex items-center px-5 pt-4">
      {shown.map((m, i) => (
        <div
          key={m.id}
          className="rounded-full ring-2 ring-panel"
          style={{ marginLeft: i === 0 ? 0 : -8 }}
        >
          <Avatar name={m.name} src={m.avatar} size={38} />
        </div>
      ))}

      {extra > 0 && (
        <div
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-hover text-xs font-medium text-gray-200 ring-2 ring-panel"
          style={{ marginLeft: -8 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}