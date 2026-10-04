import { STATUS_COLORS } from "../constants/statuses";

export default function StatusBadge({ status }) {
  const fallback = {
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 ring-slate-300",
  };
  const config = STATUS_COLORS[status] || fallback;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${config.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
