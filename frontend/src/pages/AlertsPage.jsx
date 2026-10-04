import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQueryParam } from "../hooks/useQueryParam";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import AlertCard from "../components/alerts/AlertCard";
import AlertFilterTabs from "../components/alerts/AlertFilterTabs";
import ResolvedAlertsList from "../components/alerts/ResolvedAlertsList";
import {
  selectAllAlerts,
  selectActiveAlerts,
  acknowledgeAlert,
  resolveAlert,
} from "../store/slices/alertsSlice";
import { selectAllEquipment } from "../store/slices/equipmentSlice";

export default function AlertsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useQueryParam("status");

  const activeAlerts = useSelector(selectActiveAlerts);
  const allAlerts = useSelector(selectAllAlerts);
  const equipment = useSelector(selectAllEquipment);

  const filteredAlerts = statusFilter
    ? activeAlerts.filter((a) => a.status === statusFilter)
    : activeAlerts;

  const eqMap = Object.fromEntries(equipment.map((e) => [e.id, e.name]));
  const resolvedAlerts = allAlerts.filter((a) => a.status === "Resolved").slice(0, 5);

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
        actions={<AlertFilterTabs selectedStatus={statusFilter} onSelectStatus={setStatusFilter} />}
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
                  onAcknowledge={(id) => dispatch(acknowledgeAlert(id))}
                  onResolve={(id) => dispatch(resolveAlert(id))}
                  onOpen={(eqId) => navigate(`/equipment/${eqId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      <ResolvedAlertsList alerts={resolvedAlerts} equipmentMap={eqMap} />
    </div>
  );
}
