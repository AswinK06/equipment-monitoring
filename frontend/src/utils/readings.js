import { formatTime } from "./format";

/**
 * Adds a new reading sample to existing rows (keeping at most 60 rows).
 * Missing metrics in the new sample carry forward from the previous row.
 */
export function addSample(rows, ts, metrics) {
  const previous = rows.at(-1) || {};
  const newRow = {
    ...previous,
    ...metrics,
    ts,
    t: formatTime(ts),
  };
  return [...rows, newRow].slice(-60);
}

/**
 * Converts a flat list of reading objects into pivoted rows grouped by timestamp.
 */
export function rowsFromHistory(list) {
  if (!list || list.length === 0) return [];
  const byTs = new Map();
  list.forEach((r) => {
    const existing = byTs.get(r.timestamp) || {};
    byTs.set(r.timestamp, { ...existing, [r.metric]: r.value });
  });

  return [...byTs].reduce((rows, [ts, metrics]) => addSample(rows, ts, metrics), []);
}
