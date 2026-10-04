export function formatNumber(v) {
  return v == null ? "—" : Number(v).toFixed(1);
}

export function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour12: false });
}

export function formatRelativeTime(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "—";
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) {
    return "just now";
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} min ago`;
  }
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour} h ago`;
  }
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} ${diffDay === 1 ? "day" : "days"} ago`;
}
