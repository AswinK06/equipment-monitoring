import StatCard from "../ui/StatCard";
import { STATUSES, STATUS_COLORS } from "../../constants/statuses";

export default function StatusSummary({
  counts = {},
  selectedStatus = "",
  onSelectStatus,
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {STATUSES.map((s) => (
        <StatCard
          key={s}
          label={s}
          value={counts[s] || 0}
          dotClass={STATUS_COLORS[s]?.dot}
          selected={selectedStatus === s}
          onClick={() => onSelectStatus(s)}
        />
      ))}
    </div>
  );
}
