import { useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { isAdmin } from "../utils/roles";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import MetricTabs from "../components/MetricTabs";
import MetricChart from "../components/MetricChart";
import ReadingsTable from "../components/ReadingsTable";
import AlertHistoryList from "../components/AlertHistoryList";
import EquipmentForm from "../components/EquipmentForm";

export default function EquipmentDetailPage({ db, id, onBack, onSave }) {
  const { user } = useAuth();
  const canEdit = isAdmin(user);
  const [metric, setMetric] = useState("temperature");
  const [isEditing, setIsEditing] = useState(false);

  const equipment = db.equipment.find((x) => x.id === id);
  if (!equipment) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">Equipment not found.</p>
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to fleet
        </Button>
      </div>
    );
  }

  const history = db.readings[id] || [];
  const latest = history.at(-1) || {};
  const alertHistory = db.alerts.filter((a) => a.equipmentId === id);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-brand-navy transition-colors"
      >
        <ArrowLeft size={16} /> Back to all equipment
      </button>

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

      <MetricTabs latest={latest} selectedMetric={metric} onSelect={setMetric} />

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
          onSave={onSave}
        />
      )}
    </div>
  );
}
