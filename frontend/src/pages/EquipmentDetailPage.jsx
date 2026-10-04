import { useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, Pencil } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { isAdmin } from "../utils/roles";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
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
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} /> Back to fleet
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-brand-navy transition-colors"
      >
        <ArrowLeft size={16} /> Back to all equipment
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-green">
            {equipment.type} · UNIT #{equipment.id}
          </span>
          <h1 className="text-2xl font-extrabold text-brand-navy sm:text-3xl mt-0.5">
            {equipment.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Located at {equipment.location} · Commissioned on {equipment.installedDate}
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

      <MetricTabs latest={latest} selectedMetric={metric} onSelect={handleSelectMetric} />

      <MetricChart data={history} metric={metric} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Telemetry Stream
            </h3>
            <span className="text-[11px] text-slate-400">Latest 10 packets</span>
          </div>
          <ReadingsTable readings={history.slice(-10).reverse()} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Alert Incident History
            </h3>
            <span className="text-[11px] text-slate-400">{alertHistory.length} total events</span>
          </div>
          <AlertHistoryList alerts={alertHistory} />
        </div>
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
