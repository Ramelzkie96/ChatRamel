const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    : "—";

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between border-t border-line py-3.5 first:border-t-0">
      <span className="text-sm text-gray-300">{label}</span>
      {children}
    </div>
  );
}

export default function AccountInfoCard({ user }) {
  return (
    <section className="rounded-2xl border border-line bg-panel px-5 pb-1 pt-5">
      <h3 className="mb-2 text-lg font-semibold">Account Info</h3>

      <Row label="Member Since">
        <span className="text-sm text-gray-200">{formatDate(user.createdAt)}</span>
      </Row>

      <Row label="Last Seen">
        <span className="text-sm text-green-400">Online</span>
      </Row>

      <Row label="Account Status">
        <span className="flex items-center gap-1.5 text-sm text-green-400">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Active
        </span>
      </Row>
    </section>
  );
}