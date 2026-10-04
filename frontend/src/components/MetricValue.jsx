import { LIMITS, UNITS } from "../constants/metrics";
import { formatNumber } from "../utils/format";

export default function MetricValue({ metric, value }) {
  const limit = LIMITS[metric];
  const isOver = limit != null && value != null && value > limit;
  const unit = UNITS[metric] || "";

  return (
    <span
      className={`tabular-nums ${
        isOver ? "font-bold text-red-600" : "font-medium text-slate-800"
      }`}
    >
      {formatNumber(value)}{" "}
      <span className="text-xs font-normal text-slate-400">{unit}</span>
    </span>
  );
}
