export default function AlertFilterTabs({ selectedStatus = "", onSelectStatus }) {
  const tabs = ["All", "Open", "Acknowledged"];

  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
      {tabs.map((status) => {
        const isSelected = (status === "All" && !selectedStatus) || selectedStatus === status;
        return (
          <button
            key={status}
            type="button"
            onClick={() => onSelectStatus(status === "All" ? null : status)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              isSelected
                ? "bg-white text-brand-navy shadow-sm"
                : "text-slate-600 hover:text-brand-navy"
            }`}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
}
