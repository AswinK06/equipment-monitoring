export default function LiveIndicator({ isLive = false }) {
  return (
    <div
      className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"
      title={isLive ? "Telemetry live" : "Reconnecting to telemetry stream…"}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
        }`}
      />
      <span>{isLive ? "Live" : "Reconnecting…"}</span>
    </div>
  );
}
