import { CheckCircle2 } from "lucide-react";

export default function EmptyState({ message, action, icon: Icon = CheckCircle2 }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
      <Icon size={40} className="text-slate-400 mb-3" />
      <p className="text-base font-medium text-slate-700">{message || "No data available."}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
