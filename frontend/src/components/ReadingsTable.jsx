import MetricValue from "./MetricValue";
import EmptyState from "./EmptyState";

export default function ReadingsTable({ rows = [] }) {
  if (rows.length === 0) {
    return <EmptyState message="No recent telemetry readings recorded yet." />;
  }

  // Show latest 10 rows in reverse (newest first)
  const displayRows = [...rows].reverse().slice(0, 10);

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full text-left text-xs">
        <thead className="border-b border-slate-100 bg-slate-50 text-slate-500 font-semibold uppercase">
          <tr>
            <th className="px-3.5 py-2.5">Time</th>
            <th className="px-3.5 py-2.5 text-right">Temperature</th>
            <th className="px-3.5 py-2.5 text-right">Vibration</th>
            <th className="px-3.5 py-2.5 text-right">Pressure</th>
            <th className="px-3.5 py-2.5 text-right">Runtime</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {displayRows.map((r, i) => (
            <tr key={r.ts || i} className="hover:bg-slate-50/50">
              <td className="px-3.5 py-2 font-mono text-slate-600">{r.t}</td>
              <td className="px-3.5 py-2 text-right">
                <MetricValue metric="temperature" value={r.temperature} />
              </td>
              <td className="px-3.5 py-2 text-right">
                <MetricValue metric="vibration" value={r.vibration} />
              </td>
              <td className="px-3.5 py-2 text-right">
                <MetricValue metric="pressure" value={r.pressure} />
              </td>
              <td className="px-3.5 py-2 text-right">
                <MetricValue metric="runtime" value={r.runtime} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
