import { AlertTriangle } from "lucide-react";

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-center gap-2.5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200"
    >
      <AlertTriangle size={18} className="shrink-0 text-red-500" />
      <span>{message}</span>
    </div>
  );
}
