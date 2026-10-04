import StatusBadge from "../ui/StatusBadge";
import EmptyState from "../ui/EmptyState";

export default function AlertHistoryList({ alerts = [] }) {
  if (alerts.length === 0) {
    return <EmptyState message="No alert history recorded for this equipment." />;
  }

  return (
    <div className="space-y-3">
      {alerts.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-xs transition-colors hover:bg-slate-50"
        >
          <div>
            <div className="font-semibold text-slate-800 text-sm">
              {a.metric} {a.kind === "Max" || a.kind === 1 ? "exceeded" : "dropped below"} limit (
              {a.value} vs {a.threshold})
            </div>
            <div className="text-xs text-slate-400 mt-1">{a.time || a.createdAt}</div>
          </div>
          <StatusBadge status={a.status} />
        </div>
      ))}
    </div>
  );
}
