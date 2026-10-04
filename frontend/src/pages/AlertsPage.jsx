import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import AlertCard from "../components/AlertCard";
import Card from "../components/Card";
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
    if (!status || status === "All" || statusFilter === status) {
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

      <Card
        title="Unresolved Breaches"
        description={`Active threshold violations (${filteredAlerts.length})`}
        actions={
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {["All", "Open", "Acknowledged"].map((status) => {
              const isSelected =
                (status === "All" && !statusFilter) || statusFilter === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleFilterClick(status === "All" ? null : status)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-white text-brand-navy shadow-sm"
                      : "text-slate-600 hover:text-brand-navy"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        }
      >
        <div className="p-6">
          {filteredAlerts.length === 0 ? (
            <EmptyState message="All clear. No active threshold breaches detected." />
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  equipmentName={eqMap[alert.equipmentId]}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                  onOpen={handleSelectEquipment}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {resolvedAlerts.length > 0 && (
        <Card
          title="Recently Resolved Incidents"
          description="Last 5 resolved threshold breach events"
        >
          <div className="divide-y divide-slate-100">
            {resolvedAlerts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-6 text-sm transition-colors hover:bg-slate-50"
              >
                <div>
                  <span className="font-bold text-brand-navy">
                    {eqMap[a.equipmentId] || `Unit #${a.equipmentId}`}
                  </span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="text-slate-600">
                    {a.metric} {a.kind === "Max" || a.kind === 1 ? "exceeded" : "breached"}{" "}
                    (measured: {a.value}, threshold: {a.threshold})
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
      )}
    </div>
  );
}
