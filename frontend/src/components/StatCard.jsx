export default function StatCard({ label, value, dotClass, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 min-w-[130px] flex-col rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition-all hover:shadow-md ${
        selected ? "ring-2 ring-brand-green bg-emerald-50/20" : "ring-slate-100 hover:ring-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        {dotClass && <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />}
      </div>
      <span className="mt-2 text-3xl font-extrabold text-brand-green">{value ?? 0}</span>
    </button>
  );
}
