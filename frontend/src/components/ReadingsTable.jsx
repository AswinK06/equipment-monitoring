import MetricValue from "./MetricValue";
import EmptyState from "./EmptyState";

export default function ReadingsTable({ rows = [], bordered = false }) {
  if (rows.length === 0) {
    return <EmptyState message="No recent telemetry readings recorded yet." />;
  }

  // Show latest 10 rows in reverse (newest first)
  const displayRows = [...rows].reverse().slice(0, 10);

  const table = (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-6 py-3.5">Time</th>
            <th className="px-6 py-3.5 text-right">Temperature</th>
            <th className="px-6 py-3.5 text-right">Vibration</th>
            <th className="px-6 py-3.5 text-right">Pressure</th>
            <th className="px-6 py-3.5 text-right">Runtime</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {displayRows.map((r, i) => (
            <tr key={r.ts || i} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm font-mono text-slate-600">{r.t}</td>
              <td className="px-6 py-4 text-sm text-right">
                <MetricValue metric="temperature" value={r.temperature} />
              </td>
              <td className="px-6 py-4 text-sm text-right">
                <MetricValue metric="vibration" value={r.vibration} />
              </td>
              <td className="px-6 py-4 text-sm text-right">
                <MetricValue metric="pressure" value={r.pressure} />
              </td>
              <td className="px-6 py-4 text-sm text-right">
                <MetricValue metric="runtime" value={r.runtime} />
              </td>
            </tr>
          ))}
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
