import { Link } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import { formatRelativeTime } from "../../utils/format";

export default function EquipmentHeader({ equipment, canEdit = false, onEdit }) {
  const isPaused =
    equipment.status === "Faulty" ||
    equipment.status === "Under Maintenance" ||
    equipment.status === "UnderMaintenance";

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-brand-navy transition-colors"
        >
          <ArrowLeft size={16} /> Back to all equipment
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
            {equipment.type} · UNIT #{equipment.id}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl mt-1">
            {equipment.name}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Located at <span className="font-semibold text-slate-700">{equipment.location}</span> ·
            Commissioned on{" "}
            <span className="font-semibold text-slate-700">{equipment.installedDate}</span> ·
            Updated{" "}
            <span className="font-semibold text-slate-700">
              {formatRelativeTime(equipment.updatedAt)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={equipment.status} />
          {canEdit && (
            <Button variant="secondary" onClick={onEdit}>
              <Pencil size={14} /> Edit
            </Button>
          )}
        </div>
      </div>

      {isPaused && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
          <span>
            <strong>Telemetry Paused:</strong> Unit is currently in <em>{equipment.status}</em>{" "}
            state. Live streaming is stopped; displaying last recorded telemetry values.
          </span>
        </div>
      )}
    </div>
  );
}
