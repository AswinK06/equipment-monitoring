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
}) {
  const { user } = useAuth();
  const canEdit = isAdmin(user);

  if (equipment.length === 0) {
    return <EmptyState message="No equipment found matching the selected filter." />;
  }

  const alertCountByEq = (eqId) =>
    activeAlerts.filter((a) => a.equipmentId === eqId).length;

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-3">Equipment</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Temp</th>
            <th className="px-4 py-3 text-right">Vib</th>
            <th className="px-4 py-3 text-right">Pressure</th>
            <th className="px-4 py-3">Alerts</th>
            <th className="px-4 py-3 text-right">Action</th>
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
}
