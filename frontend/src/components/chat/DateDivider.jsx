export default function DateDivider({ label = "Today" }) {
  return (
    <div className="my-4 flex justify-center">
      <span className="rounded-full border border-line bg-panel px-4 py-1 text-sm text-gray-300">
        {label}
      </span>
    </div>
  );
}