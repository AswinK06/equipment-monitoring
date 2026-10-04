import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import AlertCard from "../components/AlertCard";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import {
  selectAllAlerts,
  selectActiveAlerts,
  acknowledgeAlert,
  resolveAlert,
} from "../store/slices/alertsSlice";
import { selectAllEquipment } from "../store/slices/equipmentSlice";

export default function AlertsPage({
  onAcknowledge,
  onResolve,
  onSelectEquipment,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeAlerts = useSelector(selectActiveAlerts);
  const allAlerts = useSelector(selectAllAlerts);
  const equipment = useSelector(selectAllEquipment);

  const statusFilter = searchParams.get("status");

  const handleFilterClick = (status) => {
    const next = Object.fromEntries(searchParams.entries());
    if (statusFilter === status) {
      delete next.status;
    } else {
      next.status = status;
    }
    setSearchParams(next);
  };

  const filteredAlerts = statusFilter
    ? activeAlerts.filter((a) => a.status === statusFilter)
    : activeAlerts;

  const eqMap = Object.fromEntries(equipment.map((e) => [e.id, e.name]));
  const resolvedAlerts = allAlerts
    .filter((a) => a.status === "Resolved")
    .slice(0, 5);

  const handleAcknowledge = (id) => {
    if (onAcknowledge) {
      onAcknowledge(id);
    } else {
      dispatch(acknowledgeAlert(id));
    }
  };

  const handleResolve = (id) => {
    if (onResolve) {
      onResolve(id);
    } else {
      dispatch(resolveAlert(id));
    }
  };

  const handleSelectEquipment = (eqId) => {
    if (onSelectEquipment) {
      onSelectEquipment(eqId);
    } else {
      navigate(`/equipment/${eqId}`);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="ANOMALY DETECTION"
        title="Active"
        highlight="alerts"
        subtitle="Industrial IoT telemetry breaches detected in real time by threshold evaluation."
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Unresolved Breaches ({filteredAlerts.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFilterClick("Open")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                statusFilter === "Open"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Open
            </button>
            <button
              type="button"
              onClick={() => handleFilterClick("Acknowledged")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                statusFilter === "Acknowledged"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Acknowledged
            </button>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <EmptyState message="All systems operational. No active threshold breaches detected." />
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              equipmentName={eqMap[alert.equipmentId]}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
              onOpen={handleSelectEquipment}
            />
          ))
        )}
      </div>

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
