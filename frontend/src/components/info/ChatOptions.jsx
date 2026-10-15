import { useState } from "react";
import { Bell, Ban, Trash2, AlertTriangle, UserPlus, UserMinus } from "lucide-react";
import SectionTitle from "../ui/SectionTitle";
import ToggleSwitch from "../ui/ToggleSwitch";
import ConfirmModal from "../modals/ConfirmModal";
import ReportModal from "../modals/ReportModal";
import useChatActions from "../../hooks/useChatActions";
import useContacts from "../../hooks/useContacts";
import useContactActions from "../../hooks/useContactActions";

export default function ChatOptions({ chat }) {
  const [muted, setMuted] = useState(false);
  const [modal, setModal] = useState(null); // "block" | "unblock" | "clear" | "report" | "removeContact"
  const actions = useChatActions(chat.id, chat.other?._id, chat.name);
  const contactActions = useContactActions();
  const { isContact } = useContacts();

  const blocked = chat.blockedByMe;
  const person = chat.other ? { _id: chat.other._id, name: chat.name } : null;
  const inContacts = person ? isContact(person._id) : false;
  const close = () => setModal(null);

  const rowClass =
    "flex w-full items-center gap-3 rounded-lg py-2 text-left text-[15px] text-gray-200 transition-colors hover:text-white";

  return (
    <section className="border-t border-line px-6 py-5">
      <SectionTitle>Options</SectionTitle>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3 py-2 text-[15px] text-gray-200">
          <Bell size={19} strokeWidth={1.8} className="shrink-0" />
          <span className="flex-1">Mute notifications</span>
          <ToggleSwitch checked={muted} onChange={setMuted} />
        </div>

        {person &&
          (inContacts ? (
            <button type="button" className={rowClass} onClick={() => setModal("removeContact")}>
              <UserMinus size={19} strokeWidth={1.8} /> Remove from contacts
            </button>
          ) : (
            <button type="button" className={rowClass} onClick={() => contactActions.add(person)}>
              <UserPlus size={19} strokeWidth={1.8} /> Add to contacts
            </button>
          ))}

        <button type="button" className={rowClass} onClick={() => setModal(blocked ? "unblock" : "block")}>
          <Ban size={19} strokeWidth={1.8} /> {blocked ? "Unblock user" : "Block user"}
        </button>

        <button type="button" className={rowClass} onClick={() => setModal("clear")}>
          <Trash2 size={19} strokeWidth={1.8} /> Clear chat
        </button>

        <button type="button" className={`${rowClass} hover:text-red-400`} onClick={() => setModal("report")}>
          <AlertTriangle size={19} strokeWidth={1.8} /> Report
        </button>
      </div>

      {modal === "removeContact" && person && (
        <ConfirmModal
          danger
          title="Remove from contacts?"
          message={`${chat.name} will be removed from your contacts. Your chat history stays, and they won't be told.`}
          confirmLabel="Remove"
          onConfirm={() => contactActions.remove(person)}
          onClose={close}
        />
      )}

      {modal === "block" && (
        <ConfirmModal
          danger
          title={`Block ${chat.name}?`}
          message={`${chat.name} won't be able to message you, and you won't be able to message them. They won't be notified, and you can unblock at any time.`}
          confirmLabel="Block"
          onConfirm={actions.block}
          onClose={close}
        />
      )}

      {modal === "unblock" && (
        <ConfirmModal
          title={`Unblock ${chat.name}?`}
          message="You'll both be able to send messages again, and your old messages will still be here."
          confirmLabel="Unblock"
          onConfirm={actions.unblock}
          onClose={close}
        />
      )}

      {modal === "clear" && (
        <ConfirmModal
          danger
          title="Clear this chat?"
          message={`All messages, photos and files in this chat will be removed for you only. ${chat.name} will still have their copy. This can't be undone.`}
          confirmLabel="Clear chat"
          onConfirm={actions.clear}
          onClose={close}
        />
      )}

      {modal === "report" && (
        <ReportModal
          name={chat.name}
          alreadyBlocked={blocked}
          onSubmit={actions.report}
          onClose={close}
        />
      )}
    </section>
  );
}