import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { LIMITS, UNITS } from "../constants/metrics";
import { formatNumber } from "../utils/format";

export default function MetricChart({ data = [], metric = "temperature" }) {
  const limit = LIMITS[metric];
  const unit = UNITS[metric] || "";

  return (
    <div className="rounded-2xl bg-brand-navy p-5 shadow-lg ring-1 ring-white/10">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-wider text-brand-mint">
          {metric} TREND · LAST 60 SAMPLES
        </span>
        {limit != null && (
          <span className="font-medium text-red-400">
            Limit: {limit} {unit}
          </span>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
            <XAxis
              dataKey="t"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0B1B47",
                borderColor: "rgba(34, 229, 160, 0.3)",
                borderRadius: "0.75rem",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(v) => [`${formatNumber(v)} ${unit}`, metric]}
            />
            {limit != null && (
              <ReferenceLine
                y={limit}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: `Limit ${limit}`,
                  fill: "#f87171",
                  fontSize: 10,
                  position: "right",
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey={metric}
              stroke="#22E5A0"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
