import { useAuth } from "../hooks/useAuth";
import { isAdmin } from "../utils/roles";
import EquipmentRow from "./EquipmentRow";
import EmptyState from "./EmptyState";

export default function EquipmentTable({
  equipment = [],
  readings = {},
  activeAlerts = [],
  onSelect,
  onEdit,
  emptyMessage,
  emptyAction,
  bordered = false,
}) {
  const { user } = useAuth();
  const canEdit = isAdmin(user);

  if (equipment.length === 0) {
    return (
      <EmptyState
        message={emptyMessage || "No equipment found matching the selected filter."}
        action={emptyAction}
      />
    );
  }

  const alertCountByEq = (eqId) =>
    activeAlerts.filter((a) => a.equipmentId === eqId).length;

  const table = (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-6 py-3.5">Equipment</th>
            <th className="px-6 py-3.5">Type</th>
            <th className="px-6 py-3.5">Location</th>
            <th className="px-6 py-3.5">Status</th>
            <th className="px-6 py-3.5 text-right">Temp</th>
            <th className="px-6 py-3.5 text-right">Vib</th>
            <th className="px-6 py-3.5 text-right">Pressure</th>
            <th className="px-6 py-3.5">Alerts</th>
            <th className="px-6 py-3.5">Updated</th>
            <th className="px-6 py-3.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {equipment.map((item) => {
            const history = readings[item.id] || [];
            const latest = history.at(-1) || {};
            return (
              <EquipmentRow
                key={item.id}
                item={item}
                latestReading={latest}
                alertCount={alertCountByEq(item.id)}
                canEdit={canEdit}
                onSelect={onSelect}
                onEdit={onEdit}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (bordered) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {table}
      </div>
    );
  }

  return table;
}
