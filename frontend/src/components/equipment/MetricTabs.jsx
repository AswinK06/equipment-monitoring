import { METRIC_NAMES } from "../../constants/metrics";
import MetricValue from "../ui/MetricValue";

export default function MetricTabs({ latest = {}, selectedMetric, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {METRIC_NAMES.map((m) => {
        const isSelected = selectedMetric === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onSelect(m)}
            className={`flex flex-1 min-w-[120px] flex-col rounded-xl p-3 text-left transition-all ${
              isSelected
                ? "bg-white shadow-sm ring-2 ring-brand-green"
                : "bg-slate-100 hover:bg-slate-200/70"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {m}
            </span>
            <span className="mt-1 text-base font-bold">
              <MetricValue metric={m} value={latest[m]} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
