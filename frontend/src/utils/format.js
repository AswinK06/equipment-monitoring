export function formatNumber(v) {
  return v == null ? "—" : Number(v).toFixed(1);
}

export function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour12: false });
}
