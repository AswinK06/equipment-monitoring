import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, Pencil } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { isAdmin } from "../utils/roles";
import { formatRelativeTime } from "../utils/format";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import Card from "../components/Card";
import Loading from "../components/Loading";
import MetricTabs from "../components/MetricTabs";
import MetricChart from "../components/MetricChart";
import ReadingsTable from "../components/ReadingsTable";
import AlertHistoryList from "../components/AlertHistoryList";
import EquipmentForm from "../components/EquipmentForm";
import { selectEquipmentById, saveEquipment } from "../store/slices/equipmentSlice";
import { selectReadingsByEquipment, selectLatestReading } from "../store/slices/readingsSlice";
import { selectAlertsByEquipment } from "../store/slices/alertsSlice";

export default function EquipmentDetailPage({ id: propId, onBack, onSave }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { id: paramId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const equipmentId = propId !== undefined ? propId : paramId;
  const metric = searchParams.get("metric") || "temperature";

  const loading = useSelector((state) => state.equipment.loading);
  const equipment = useSelector(selectEquipmentById(equipmentId));
  const history = useSelector(selectReadingsByEquipment(equipmentId));
  const latest = useSelector(selectLatestReading(equipmentId));
  const alertHistory = useSelector(selectAlertsByEquipment(equipmentId));

  const canEdit = isAdmin(user);
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectMetric = (m) => {
    const next = Object.fromEntries(searchParams.entries());
    next.metric = m;
    setSearchParams(next);
  };

  const handleSaveEquipment = async (item) => {
    if (onSave) {
      await onSave(item);
    } else {
      await dispatch(saveEquipment(item)).unwrap();
    }
  };

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

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-brand-navy transition-colors"
        >
          <ArrowLeft size={16} /> Back to all equipment
        </Link>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
            {equipment.type} · UNIT #{equipment.id}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl mt-1">
            {equipment.name}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Located at <span className="font-semibold text-slate-700">{equipment.location}</span> · Commissioned on <span className="font-semibold text-slate-700">{equipment.installedDate}</span> · Updated <span className="font-semibold text-slate-700">{formatRelativeTime(equipment.updatedAt)}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={equipment.status} />
          {canEdit && (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              <Pencil size={14} /> Edit
            </Button>
          )}
        </div>
      </div>

      {(equipment.status === "Faulty" || equipment.status === "Under Maintenance" || equipment.status === "UnderMaintenance") && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
          <span>
            <strong>Telemetry Paused:</strong> Unit is currently in <em>{equipment.status}</em> state. Live streaming is stopped; displaying last recorded telemetry values.
          </span>
        </div>
      )}

      {/* Metric Tabs */}
      <MetricTabs latest={latest} selectedMetric={metric} onSelect={handleSelectMetric} />

      {/* Chart Card */}
      <MetricChart data={history} metric={metric} />

      {/* Two-column grid using Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title={
            (equipment.status === "Faulty" || equipment.status === "Under Maintenance" || equipment.status === "UnderMaintenance")
              ? "Recent telemetry (Paused)"
              : "Recent Telemetry Readings"
          }
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
          onSave={handleSaveEquipment}
        />
      )}
    </div>
  );
}
