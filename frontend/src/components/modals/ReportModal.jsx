import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const REASONS = [
  { id: "spam", label: "Spam" },
  { id: "harassment", label: "Harassment or bullying" },
  { id: "inappropriate", label: "Inappropriate content" },
  { id: "impersonation", label: "Impersonation" },
  { id: "other", label: "Other" },
];

// onSubmit({ reason, details, alsoBlock }) must return a promise that resolves true when it worked
export default function ReportModal({ name, alreadyBlocked, onSubmit, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!reason) return;

    setLoading(true);
    const ok = await onSubmit({
      reason,
      details: details.trim(),
      alsoBlock: alsoBlock && !alreadyBlocked,
    });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Modal title={`Report ${name}`} onClose={onClose}>
      <form onSubmit={submit}>
        <p className="mb-3 text-[15px] font-medium">Why are you reporting this person?</p>

        <div className="flex flex-col gap-2">
          {REASONS.map((r) => (
            <label
              key={r.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[15px] transition-colors ${
                reason === r.id ? "border-accent bg-accent/10" : "border-line hover:bg-hover"
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={r.id}
                checked={reason === r.id}
                onChange={() => setReason(r.id)}
                className="accent-blue-500"
              />
              {r.label}
            </label>
          ))}
        </div>

        <div className="mt-5">
          <label htmlFor="reportDetails" className="mb-2 block text-[15px] font-medium">
            Details <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="reportDetails"
            rows={3}
            maxLength={500}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Tell us what happened."
            className="w-full resize-none rounded-xl border border-line bg-[#0a1226] px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
          <p className="mt-1 text-right text-xs text-muted">{details.length}/500</p>
        </div>

        {!alreadyBlocked && (
          <label className="mt-3 flex cursor-pointer items-center gap-3 text-[15px] text-gray-200">
            <input
              type="checkbox"
              checked={alsoBlock}
              onChange={(e) => setAlsoBlock(e.target.checked)}
              className="h-4 w-4 accent-blue-500"
            />
            Also block {name}
          </label>
        )}

        <div className="mt-4 flex items-start gap-3 rounded-xl bg-hover p-3 text-xs leading-relaxed text-muted">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-blue-400" />
          <p>
            To help us review this, the last 10 messages you can see in this chat are attached to
            your report. Photos and files are not included, and {name} won't be told who reported
            them.
          </p>
        </div>

        <div className="mt-5">
          <Button type="submit" loading={loading} disabled={!reason}>
            Submit report
          </Button>
        </div>
      </form>
    </Modal>
  );
}