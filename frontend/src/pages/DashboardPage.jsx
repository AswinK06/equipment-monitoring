import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { isAdmin } from "../utils/roles";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Card from "../components/Card";
import EquipmentTable from "../components/EquipmentTable";
import EquipmentForm from "../components/EquipmentForm";
import Button from "../components/Button";
import { STATUSES, STATUS_COLORS } from "../constants/statuses";
import { selectAllEquipment, selectStatusCounts, saveEquipment } from "../store/slices/equipmentSlice";
import { selectActiveAlerts } from "../store/slices/alertsSlice";

export default function DashboardPage({ onSelect, onSave }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [modalItem, setModalItem] = useState(undefined); // undefined: closed, null: new, obj: edit

  const equipment = useSelector(selectAllEquipment);
  const counts = useSelector(selectStatusCounts);
  const activeAlerts = useSelector(selectActiveAlerts);
  const readings = useSelector((state) => state.readings.byEquipmentId);

  const statusFilter = searchParams.get("status") || null;
  const searchQuery = searchParams.get("q") || "";

  const handleFilterClick = (s) => {
    const nextParams = Object.fromEntries(searchParams.entries());
    if (statusFilter === s) {
      delete nextParams.status;
    } else {
      nextParams.status = s;
    }
    setSearchParams(nextParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const nextParams = Object.fromEntries(searchParams.entries());
    if (val.trim()) {
      nextParams.q = val;
    } else {
      delete nextParams.q;
    }
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    const nextParams = Object.fromEntries(searchParams.entries());
    delete nextParams.status;
    delete nextParams.q;
    setSearchParams(nextParams);
  };

  const isFilterActive = Boolean(statusFilter || searchQuery.trim());

  const filteredEquipment = equipment.filter((e) => {
    if (statusFilter && e.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (e.name || "").toLowerCase().includes(q);
      const typeMatch = (e.type || "").toLowerCase().includes(q);
      const locMatch = (e.location || "").toLowerCase().includes(q);
      if (!nameMatch && !typeMatch && !locMatch) return false;
    }
    return true;
  });

  const canEdit = isAdmin(user);

  const handleSelectEquipment = (id) => {
    if (onSelect) {
      onSelect(id);
    } else {
      navigate(`/equipment/${id}`);
    }
  };

  const handleSaveEquipment = async (item) => {
    if (onSave) {
      await onSave(item);
    } else {
      await dispatch(saveEquipment(item)).unwrap();
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="LIVE FLEET STATUS"
        title="Equipment"
        highlight="Intelligence"
        subtitle={`${equipment.length} machines monitored in real time across all plant facilities.`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {STATUSES.map((s) => (
          <StatCard
            key={s}
            label={s}
            value={counts[s] || 0}
            dotClass={STATUS_COLORS[s]?.dot}
            selected={statusFilter === s}
            onClick={() => handleFilterClick(s)}
          />
        ))}
      </div>

      <Card
        title="Equipment fleet"
        description="Search your machines, filter by status, open one to see live trends, or update its details."
      >
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
                onChange={handleSearchChange}
                placeholder="Search by name, type or location"
                className="h-11 w-full rounded-lg border border-slate-300 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            {canEdit && (
              <Button variant="primary" onClick={() => setModalItem(null)}>
                <Plus size={16} /> Add equipment
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500 px-1">
            <span>
              Showing {filteredEquipment.length} of {equipment.length} machines
            </span>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm font-semibold text-brand-green hover:underline focus:outline-none"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <EquipmentTable
          equipment={filteredEquipment}
          readings={readings}
          activeAlerts={activeAlerts}
          onSelect={handleSelectEquipment}
          onEdit={(item) => setModalItem(item)}
          emptyMessage={
            equipment.length === 0
              ? "No equipment registered yet."
              : "No equipment matches the search or filter criteria."
          }
          emptyAction={
            equipment.length === 0 ? (
              canEdit ? (
                <Button variant="primary" onClick={() => setModalItem(null)}>
                  <Plus size={16} /> Add equipment
                </Button>
              ) : null
            ) : (
              <Button variant="secondary" onClick={handleClearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      </Card>

      {modalItem !== undefined && canEdit && (
        <EquipmentForm
          item={modalItem}
          onClose={() => setModalItem(undefined)}
          onSave={handleSaveEquipment}
        />
      )}
    </div>
  );
}
