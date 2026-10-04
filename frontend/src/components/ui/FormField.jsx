export default function FormField({ label, error, children, className = "" }) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${className}`}>
      {label && <span className="block mb-1.5">{label}</span>}
      {children}
      {error && <p className="text-sm text-red-600 mt-1.5 font-normal">{error}</p>}
    </label>
  );
}
