import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";

export default function AlertHistoryList({ alerts = [] }) {
  if (alerts.length === 0) {
    return <EmptyState message="No alert history recorded for this equipment." />;
  }

  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded-xl bg-white p-3 text-xs shadow-sm ring-1 ring-slate-100"
        >
          <div>
            <div className="font-semibold text-slate-800">
              {a.metric} {a.kind === "Max" || a.kind === 1 ? "exceeded" : "dropped below"} limit (
              {a.value} vs {a.threshold})
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{a.time || a.createdAt}</div>
          </div>
          <StatusBadge status={a.status} />
        </div>
      ))}
    </div>
  );
}
