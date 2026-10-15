export default function Logo({ size = 48, textClass = "text-3xl" }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 shadow-lg shadow-blue-500/30"
        style={{ width: size, height: size }}
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="rounded-full bg-white"
              style={{ width: size * 0.12, height: size * 0.12 }}
            />
          ))}
        </div>
        {/* bubble tail */}
        <span
          className="absolute -bottom-1 left-2 h-3 w-3 rotate-45 bg-blue-700"
          style={{ borderBottomLeftRadius: 3 }}
        />
      </div>

      <h1 className={`font-bold tracking-tight ${textClass}`}>
        Chat<span className="text-blue-500">Ramel</span>
      </h1>
    </div>
  );
}