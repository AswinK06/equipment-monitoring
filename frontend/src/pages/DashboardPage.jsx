import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { isAdmin } from "../utils/roles";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
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

  const filter = searchParams.get("status") || null;

  const handleFilterClick = (s) => {
    if (filter === s) {
      searchParams.delete("status");
      setSearchParams(searchParams);
    } else {
      const nextParams = Object.fromEntries(searchParams.entries());
      nextParams.status = s;
      setSearchParams(nextParams);
    }
  };

  const filteredEquipment = equipment.filter((e) => !filter || e.status === filter);
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="LIVE FLEET STATUS"
        title="Equipment"
        highlight="Intelligence"
        subtitle={`${equipment.length} machines monitored in real time across all plant facilities.`}
      >
        {canEdit && (
          <Button variant="primary" onClick={() => setModalItem(null)}>
            <Plus size={16} /> Add equipment
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUSES.map((s) => (
          <StatCard
            key={s}
            label={s}
            value={counts[s] || 0}
            dotClass={STATUS_COLORS[s]?.dot}
            selected={filter === s}
            onClick={() => handleFilterClick(s)}
          />
        ))}
      </div>

      <EquipmentTable
        equipment={filteredEquipment}
        readings={readings}
        activeAlerts={activeAlerts}
        onSelect={handleSelectEquipment}
        onEdit={(item) => setModalItem(item)}
      />

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
