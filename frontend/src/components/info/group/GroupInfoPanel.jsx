import { useState } from "react";
import { LogOut } from "lucide-react";
import GroupHeader from "./GroupHeader";
import GroupQuickActions from "./GroupQuickActions";
import MembersList from "./MembersList";
import SharedFiles from "../SharedFiles";
import EditGroupModal from "../../modals/EditGroupModal";
import AddMembersModal from "../../modals/AddMembersModal";
import ConfirmModal from "../../modals/ConfirmModal";
import MediaFilesModal from "../../modals/MediaFilesModal";
import useGroupActions from "../../../hooks/useGroupActions";

export default function GroupInfoPanel({ chat, profile }) {
  const members = profile.members || [];
  const { isAdmin } = profile;

  const actions = useGroupActions(chat.id);
  const [modal, setModal] = useState(null); // { type: "edit" | "add" | "leave" | "remove" | "media", member? }

  const close = () => setModal(null);

  return (
    <>
      <GroupHeader
        name={chat.name}
        src={profile.cover}
        category={profile.category}
        memberCount={members.length}
        description={profile.description}
        uploading={actions.uploading}
        canEdit={isAdmin}
        onEdit={() => setModal({ type: "edit" })}
      />

      <GroupQuickActions
        isAdmin={isAdmin}
        uploading={actions.uploading}
        onAdd={() => setModal({ type: "add" })}
        onEdit={() => setModal({ type: "edit" })}
        onChangePhoto={actions.uploadCover}
        onOpenMedia={() => setModal({ type: "media" })}
      />

      <MembersList
        members={members}
        viewerIsAdmin={isAdmin}
        onMessage={(m) => actions.messageMember(m.id)}
        onSetRole={(m, role) => actions.setRole(m.id, m.name, role)}
        onRemove={(m) => setModal({ type: "remove", member: m })}
      />

      <SharedFiles chatId={chat.id} />

      <div className="border-t border-line px-6 py-4">
        <button
          type="button"
          onClick={() => setModal({ type: "leave" })}
          className="flex items-center gap-3 py-2 text-[15px] text-red-500 transition-colors hover:text-red-400"
        >
          <LogOut size={20} strokeWidth={1.8} />
          Leave Group
        </button>
      </div>

      {modal?.type === "media" && <MediaFilesModal chatId={chat.id} onClose={close} />}

      {modal?.type === "edit" && (
        <EditGroupModal
          initial={{
            name: chat.name,
            description: profile.description,
            category: profile.category,
          }}
          onSave={actions.updateGroup}
          onClose={close}
        />
      )}

      {modal?.type === "add" && (
        <AddMembersModal
          existingIds={members.map((m) => m.id)}
          onAdd={actions.addMembers}
          onClose={close}
        />
      )}

      {modal?.type === "remove" && (
        <ConfirmModal
          danger
          title="Remove member?"
          message={`${modal.member.name} will no longer be able to see or send messages in ${chat.name}.`}
          confirmLabel="Remove"
          onConfirm={() => actions.removeMember(modal.member.id, modal.member.name)}
          onClose={close}
        />
      )}

      {modal?.type === "leave" && (
        <ConfirmModal
          danger
          title="Leave group?"
          message={`You will stop receiving messages from ${chat.name}. Someone else will need to add you back if you want to rejoin.`}
          confirmLabel="Leave"
          onConfirm={() => actions.leave(chat.name)}
          onClose={close}
        />
      )}
    </>
  );
}