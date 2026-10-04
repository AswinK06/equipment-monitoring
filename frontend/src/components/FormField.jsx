export default function FormField({ label, children }) {
  return (
    <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}
