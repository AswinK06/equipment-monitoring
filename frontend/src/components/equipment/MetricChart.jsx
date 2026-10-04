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
import { LIMITS, UNITS } from "../../constants/metrics";
import { formatNumber } from "../../utils/format";

export default function MetricChart({ data = [], metric = "temperature" }) {
  const limit = LIMITS[metric];
  const unit = UNITS[metric] || "";
  const sampleCount = data.length || 60;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-slate-600">
          {metric} TREND · LAST {sampleCount} SAMPLES
        </span>
        {limit != null && (
          <span className="font-semibold text-red-600">
            Limit: {limit} {unit}
          </span>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="t"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#E2E8F0",
                borderRadius: "0.75rem",
                color: "#1E2A4A",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              }}
              formatter={(v) => [`${formatNumber(v)} ${unit}`, metric]}
            />
            {limit != null && (
              <ReferenceLine
                y={limit}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{
                  value: `Limit ${limit}`,
                  fill: "#EF4444",
                  fontSize: 10,
                  position: "right",
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey={metric}
              stroke="#059669"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
