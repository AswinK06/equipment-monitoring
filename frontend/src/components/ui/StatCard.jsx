export default function StatCard({ label, value, dotClass, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 min-w-[130px] flex-col rounded-2xl border bg-white p-6 text-left shadow-sm transition-all hover:shadow-md ${
        selected
          ? "border-brand-green ring-2 ring-brand-green bg-emerald-50/20"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {dotClass && <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />}
      </div>
      <span className="mt-3 text-3xl sm:text-4xl font-extrabold text-brand-green">
        {value ?? 0}
      </span>
    </button>
  );
}
