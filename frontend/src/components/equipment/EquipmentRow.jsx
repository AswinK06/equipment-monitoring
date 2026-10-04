import { Pencil, Trash2 } from "lucide-react";
import StatusBadge from "../ui/StatusBadge";
import AlertCountBadge from "../ui/AlertCountBadge";
import MetricValue from "../ui/MetricValue";
import { formatRelativeTime } from "../../utils/format";

export default function EquipmentRow({
  item,
  latestReading = {},
  alertCount = 0,
  canEdit = false,
  onSelect,
  onEdit,
  onDelete,
}) {
  const isTelemetryPaused =
    item.status === "Faulty" ||
    item.status === "Under Maintenance" ||
    item.status === "UnderMaintenance";

  return (
    <tr
      onClick={() => onSelect(item.id)}
      className="cursor-pointer transition-colors hover:bg-slate-50 group"
    >
      <td className="px-6 py-4 text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
        <div className="flex items-center gap-2">
          <span>{item.name}</span>
          {isTelemetryPaused && (
            <span
              title="Telemetry paused (showing last recorded reading)"
              className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 ring-1 ring-slate-200"
            >
              Frozen
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">{item.type}</td>
      <td className="px-6 py-4 text-sm text-slate-500">{item.location}</td>
      <td className="px-6 py-4 text-sm">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-6 py-4 text-sm text-right">
        <MetricValue metric="temperature" value={latestReading.temperature} />
      </td>
      <td className="px-6 py-4 text-sm text-right">
        <MetricValue metric="vibration" value={latestReading.vibration} />
      </td>
      <td className="px-6 py-4 text-sm text-right">
        <MetricValue metric="pressure" value={latestReading.pressure} />
      </td>
      <td className="px-6 py-4 text-sm">
        <AlertCountBadge count={alertCount} />
      </td>
      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
        {formatRelativeTime(item.updatedAt)}
      </td>
      <td className="px-6 py-4 text-sm text-right" onClick={(e) => e.stopPropagation()}>
        {canEdit && (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`Edit ${item.name}`}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-navy transition-all"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              aria-label={`Delete ${item.name}`}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
