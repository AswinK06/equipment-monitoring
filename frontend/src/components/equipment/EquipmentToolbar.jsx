import { Plus, Search } from "lucide-react";
import Button from "../ui/Button";

export default function EquipmentToolbar({
  searchQuery = "",
  onSearchChange,
  onClearFilters,
  canAdd = false,
  onAdd,
  filteredCount = 0,
  totalCount = 0,
  isFilterActive = false,
}) {
  return (
    <div className="p-6 space-y-4 border-b border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, type or location"
            className="h-11 w-full rounded-lg border border-slate-300 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
        </div>

        {canAdd && (
          <Button variant="primary" onClick={onAdd}>
            <Plus size={16} /> Add equipment
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500 px-1">
        <span>
          Showing {filteredCount} of {totalCount} machines
        </span>
        {isFilterActive && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-sm font-semibold text-brand-green hover:underline focus:outline-none"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
