export default function FeatureItem({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#101c3f] text-blue-400">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
    </div>
  );
}