import Card from "../ui/Card";
import StatusBadge from "../ui/StatusBadge";

export default function ResolvedAlertsList({ alerts = [], equipmentMap = {} }) {
  if (alerts.length === 0) return null;

  return (
    <Card title="Recently Resolved Incidents" description="Last 5 resolved threshold breach events">
      <div className="divide-y divide-slate-100">
        {alerts.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between p-6 text-sm transition-colors hover:bg-slate-50"
          >
            <div>
              <span className="font-bold text-brand-navy">
                {equipmentMap[a.equipmentId] || `Unit #${a.equipmentId}`}
              </span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="text-slate-600">
                {a.metric} {a.kind === "Max" || a.kind === 1 ? "exceeded" : "breached"} (measured:{" "}
                {a.value}, threshold: {a.threshold})
              </span>
              <div className="text-xs text-slate-400 mt-1">
                Resolved at {a.time || a.resolvedAt || a.createdAt}
              </div>
            </div>
            <StatusBadge status={a.status} />
          </div>
        ))}
      </div>
    </Card>
  );
}
