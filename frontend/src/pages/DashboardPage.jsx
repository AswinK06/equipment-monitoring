import { useState } from "react";
import { Plus } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import EquipmentTable from "../components/EquipmentTable";
import EquipmentForm from "../components/EquipmentForm";
import Button from "../components/Button";
import { STATUSES, STATUS_COLORS } from "../constants/statuses";

export default function DashboardPage({ db, openAlerts = [], counts = {}, onSelect, onSave }) {
  const [filter, setFilter] = useState(null);
  const [modalItem, setModalItem] = useState(undefined); // undefined: closed, null: new, obj: edit

  const filteredEquipment = db.equipment.filter((e) => !filter || e.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="LIVE FLEET STATUS"
        title="Equipment"
        highlight="Intelligence"
        subtitle={`${db.equipment.length} machines monitored in real time across all plant facilities.`}
      >
        <Button variant="primary" onClick={() => setModalItem(null)}>
          <Plus size={16} /> Add equipment
        </Button>
      </PageHeader>

      {/* Status summary stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUSES.map((s) => (
          <StatCard
            key={s}
            label={s}
            value={counts[s]}
            dotClass={STATUS_COLORS[s]?.dot}
            selected={filter === s}
            onClick={() => setFilter(filter === s ? null : s)}
          />
        ))}
      </div>

      {/* Equipment table */}
      <EquipmentTable
        equipment={filteredEquipment}
        readings={db.readings}
        activeAlerts={openAlerts}
        onSelect={onSelect}
        onEdit={(item) => setModalItem(item)}
      />

      {/* Modal form */}
      {modalItem !== undefined && (
        <EquipmentForm
          item={modalItem}
          onClose={() => setModalItem(undefined)}
          onSave={onSave}
        />
      )}
    </div>
  );
}
