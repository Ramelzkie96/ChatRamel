import MemberItem from "./MemberItem";
import SectionTitle from "../../ui/SectionTitle";

export default function MembersList({ members = [], viewerIsAdmin, onMessage, onSetRole, onRemove }) {
  // admins first (the sort is stable, so everyone else keeps their order)
  const sorted = [...members].sort((a, b) => Number(!!b.isAdmin) - Number(!!a.isAdmin));

  return (
    <section className="border-t border-line px-6 py-5">
      <SectionTitle>{`Members (${members.length})`}</SectionTitle>

      <div className="flex flex-col">
        {sorted.map((m) => (
          <MemberItem
            key={m.id}
            member={m}
            viewerIsAdmin={viewerIsAdmin}
            onMessage={onMessage}
            onSetRole={onSetRole}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}