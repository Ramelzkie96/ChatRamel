import { useState } from "react";
import { Lock, Trash2, ChevronRight } from "lucide-react";
import ChangePasswordModal from "../modals/ChangePasswordModal";
import DeleteAccountModal from "../modals/DeleteAccountModal";

function ActionRow({ icon: Icon, label, danger, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 border-t border-line py-3.5 text-left transition-colors first:border-t-0 ${
        danger ? "text-red-400 hover:text-red-300" : "text-gray-200 hover:text-white"
      }`}
    >
      <Icon size={22} strokeWidth={1.8} className="shrink-0" />
      <span className="flex-1 text-[15px]">{label}</span>
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </button>
  );
}

export default function QuickActions({ actions }) {
  const [modal, setModal] = useState(null); // "password" | "delete"
  const close = () => setModal(null);

  return (
    <section className="rounded-2xl border border-line bg-panel px-5 pb-1 pt-5">
      <h3 className="mb-2 text-lg font-semibold">Quick Actions</h3>

      <ActionRow icon={Lock} label="Change Password" onClick={() => setModal("password")} />
      <ActionRow icon={Trash2} label="Delete Account" danger onClick={() => setModal("delete")} />

      {modal === "password" && (
        <ChangePasswordModal onSubmit={actions.changePassword} onClose={close} />
      )}
      {modal === "delete" && (
        <DeleteAccountModal onSubmit={actions.deleteAccount} onClose={close} />
      )}
    </section>
  );
}