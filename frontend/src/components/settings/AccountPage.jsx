import { useState } from "react";
import ProfilePhoto from "./ProfilePhoto";
import AccountForm from "./AccountForm";
import AccountInfoCard from "./AccountInfoCard";
import QuickActions from "./QuickActions";
import PrivacyNote from "./PrivacyNote";
import ChangeEmailModal from "../modals/ChangeEmailModal";
import useAuth from "../../hooks/useAuth";
import useAccountActions from "../../hooks/useAccountActions";

export default function AccountPage() {
  const { user } = useAuth();
  const actions = useAccountActions();
  const [emailOpen, setEmailOpen] = useState(false);

  if (!user) return null;

  return (
    <main className="thin-scroll h-screen min-w-0 flex-1 overflow-y-auto bg-app p-6">
      <div className="rounded-3xl border border-line bg-panel/60 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold">Account</h2>
        <p className="mt-1 text-sm text-muted">Update your profile information and account details.</p>

        <div className="mt-8 grid gap-8 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-8">
            <ProfilePhoto
              user={user}
              uploading={actions.uploading}
              onUpload={actions.uploadAvatar}
              onRemove={actions.removeAvatar}
            />

            {/* remounts when the saved values change, so the form always starts from what's saved */}
            <AccountForm
              key={`${user.name}|${user.username ?? ""}|${user.bio ?? ""}`}
              user={user}
              onSave={actions.updateProfile}
              onChangeEmail={() => setEmailOpen(true)}
            />
          </div>

          <aside className="flex flex-col gap-5">
            <AccountInfoCard user={user} />
            <QuickActions actions={actions} />
            <PrivacyNote />
          </aside>
        </div>
      </div>

      {emailOpen && (
        <ChangeEmailModal
          currentEmail={user.email}
          onSubmit={actions.changeEmail}
          onClose={() => setEmailOpen(false)}
        />
      )}
    </main>
  );
}