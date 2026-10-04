import { Pencil } from "lucide-react";
import StatusBadge from "./StatusBadge";
import AlertCountBadge from "./AlertCountBadge";
import MetricValue from "./MetricValue";

export default function EquipmentRow({ item, latestReading = {}, alertCount = 0, onSelect, onEdit }) {
  return (
    <tr
      onClick={() => onSelect(item.id)}
      className="cursor-pointer transition-colors hover:bg-slate-50/80 group"
    >
      <td className="px-4 py-3.5 font-bold text-brand-navy group-hover:text-brand-green transition-colors">
        {item.name}
      </td>
      <td className="px-4 py-3.5 text-slate-600">{item.type}</td>
      <td className="px-4 py-3.5 text-slate-500 text-xs">{item.location}</td>
      <td className="px-4 py-3.5">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-4 py-3.5 text-right">
        <MetricValue metric="temperature" value={latestReading.temperature} />
      </td>
      <td className="px-4 py-3.5 text-right">
        <MetricValue metric="vibration" value={latestReading.vibration} />
      </td>
      <td className="px-4 py-3.5 text-right">
        <MetricValue metric="pressure" value={latestReading.pressure} />
      </td>
      <td className="px-4 py-3.5">
        <AlertCountBadge count={alertCount} />
      </td>
      <td
        className="px-4 py-3.5 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.name}`}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-navy transition-all"
        >
          <Pencil size={15} />
        </button>
      </td>
    </tr>
  );
}
