import PageHeader from "../components/PageHeader";
import AlertCard from "../components/AlertCard";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

export default function AlertsPage({
  db,
  openAlerts = [],
  onAcknowledge,
  onResolve,
  onSelectEquipment,
}) {
  const eqMap = Object.fromEntries(db.equipment.map((e) => [e.id, e.name]));
  const resolvedAlerts = db.alerts
    .filter((a) => a.status === "Resolved")
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="ANOMALY DETECTION"
        title="Active"
        highlight="alerts"
        subtitle="Industrial IoT telemetry breaches detected in real time by threshold evaluation."
      />

      {/* Active alerts section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Unresolved Breaches ({openAlerts.length})
        </h3>
        {openAlerts.length === 0 ? (
          <EmptyState message="All systems operational. No active threshold breaches detected." />
        ) : (
          openAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              equipmentName={eqMap[alert.equipmentId]}
              onAcknowledge={onAcknowledge}
              onResolve={onResolve}
              onOpen={onSelectEquipment}
            />
          ))
        )}
      </div>

      {/* Recently resolved alerts */}
      {resolvedAlerts.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recently Resolved Incidents
          </h3>
          <div className="divide-y divide-slate-100 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {resolvedAlerts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-4 text-xs transition-colors hover:bg-slate-50"
              >
                <div>
                  <span className="font-bold text-brand-navy">
                    {eqMap[a.equipmentId] || `Unit #${a.equipmentId}`}
                  </span>
                  <span className="mx-1.5 text-slate-300">·</span>
                  <span className="text-slate-600">
                    {a.metric} {a.kind === "Max" || a.kind === 1 ? "exceeded" : "breached"}{" "}
                    (measured: {a.value}, threshold: {a.threshold})
                  </span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Resolved at {a.time || a.resolvedAt || a.createdAt}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
