import { Loader2 } from "lucide-react";

export default function Loading({ text = "Loading equipment data…" }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
      <Loader2 size={32} className="animate-spin text-brand-green mb-3" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}
