import { CheckCircle2 } from "lucide-react";

export default function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-12 text-center">
      <CheckCircle2 size={36} className="text-emerald-500 mb-2" />
      <p className="text-sm font-medium text-emerald-800">{message || "No data available."}</p>
    </div>
  );
}
