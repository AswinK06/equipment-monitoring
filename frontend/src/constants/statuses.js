export const STATUSES = ["Active", "Idle", "Faulty", "Under Maintenance"];

export const STATUS_COLORS = {
  Active: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  Idle: {
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 ring-slate-300",
  },
  Faulty: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-800 ring-red-200",
  },
  "Under Maintenance": {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
  },
};
