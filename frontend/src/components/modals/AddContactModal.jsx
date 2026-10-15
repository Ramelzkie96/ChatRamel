import { useState } from "react";
import Modal from "../ui/Modal";
import UserSearch from "./UserSearch";
import useContacts from "../../hooks/useContacts";
import useContactActions from "../../hooks/useContactActions";

export default function AddContactModal({ onClose }) {
  const { contactIds } = useContacts();
  const actions = useContactActions();
  const [busyId, setBusyId] = useState(null);

  // the modal stays open so you can add several people in a row
  const pick = async (person) => {
    setBusyId(person._id);
    await actions.add(person);
    setBusyId(null);
  };

  return (
    <Modal title="Add contact" onClose={onClose}>
      <UserSearch
        onPick={pick}
        busyId={busyId}
        disabledIds={[...contactIds]}
        disabledLabel="In contacts"
      />
      <p className="mt-4 text-xs text-muted">
        Contacts are a private list. The person isn't notified when you add them.
      </p>
    </Modal>
  );
}