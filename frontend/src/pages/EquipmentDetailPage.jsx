import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useQueryParam } from "../hooks/useQueryParam";
import { isAdmin } from "../utils/roles";
import Card from "../components/ui/Card";
import Loading from "../components/ui/Loading";
import EquipmentHeader from "../components/equipment/EquipmentHeader";
import MetricTabs from "../components/equipment/MetricTabs";
import MetricChart from "../components/equipment/MetricChart";
import ReadingsTable from "../components/equipment/ReadingsTable";
import AlertHistoryList from "../components/alerts/AlertHistoryList";
import EquipmentForm from "../components/equipment/EquipmentForm";
import { selectEquipmentById, saveEquipment } from "../store/slices/equipmentSlice";
import { selectReadingsByEquipment, selectLatestReading } from "../store/slices/readingsSlice";
import { selectAlertsByEquipment } from "../store/slices/alertsSlice";

export default function EquipmentDetailPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [metricParam, setMetric] = useQueryParam("metric");
  const metric = metricParam || "temperature";

  const loading = useSelector((state) => state.equipment.loading);
  const equipment = useSelector(selectEquipmentById(id));
  const history = useSelector(selectReadingsByEquipment(id));
  const latest = useSelector(selectLatestReading(id));
  const alertHistory = useSelector(selectAlertsByEquipment(id));

  const canEdit = isAdmin(user);
  const [isEditing, setIsEditing] = useState(false);

  if (loading) {
    return <Loading text="Loading industrial equipment fleet…" />;
  }

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">Equipment not found.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} /> Back to fleet
        </Link>
      </div>
    );
  }

  const isPaused =
    equipment.status === "Faulty" ||
    equipment.status === "Under Maintenance" ||
    equipment.status === "UnderMaintenance";

  return (
    <div className="space-y-8">
      <EquipmentHeader
        equipment={equipment}
        canEdit={canEdit}
        onEdit={() => setIsEditing(true)}
      />

      <MetricTabs latest={latest} selectedMetric={metric} onSelect={setMetric} />

      <MetricChart data={history} metric={metric} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title={isPaused ? "Recent telemetry (Paused)" : "Recent Telemetry Readings"}
          description="Latest 10 recorded telemetry packets"
        >
          <ReadingsTable rows={history} />
        </Card>

        <Card
          title="Alert Incident History"
          description={`${alertHistory.length} total events`}
        >
          <div className="p-6">
            <AlertHistoryList alerts={alertHistory} />
          </div>
        </Card>
      </div>

      {isEditing && canEdit && (
        <EquipmentForm
          item={equipment}
          onClose={() => setIsEditing(false)}
          onSave={async (item) => {
            await dispatch(saveEquipment(item)).unwrap();
          }}
        />
      )}
    </div>
  );
}
