import { Bell } from "lucide-react";

export default function AlertCountBadge({ count }) {
  if (!count || count <= 0) {
    return <span className="text-xs text-slate-400">No alerts</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
      <Bell size={12} /> {count} Active {count === 1 ? "Alert" : "Alerts"}
    </span>
  );
}
