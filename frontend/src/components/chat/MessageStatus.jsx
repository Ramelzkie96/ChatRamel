import { Check, CheckCheck } from "lucide-react";

export default function MessageStatus({ time, isMine, seen }) {
  return (
    <div
      className={`mt-1 flex items-center gap-1 text-xs text-muted ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <span>{time}</span>
      {isMine &&
        (seen ? (
          <CheckCheck size={15} className="text-blue-400" />
        ) : (
          <Check size={15} className="text-muted" />
        ))}
    </div>
  );
}