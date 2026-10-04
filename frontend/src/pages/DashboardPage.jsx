import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Plus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useQueryParam } from "../hooks/useQueryParam";
import { useDeleteEquipment } from "../hooks/useDeleteEquipment";
import { isAdmin } from "../utils/roles";
import { filterEquipment } from "../utils/filters";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import StatusSummary from "../components/equipment/StatusSummary";
import EquipmentToolbar from "../components/equipment/EquipmentToolbar";
import EquipmentTable from "../components/equipment/EquipmentTable";
import EquipmentForm from "../components/equipment/EquipmentForm";
import { selectAllEquipment, selectStatusCounts, saveEquipment } from "../store/slices/equipmentSlice";
import { selectActiveAlerts } from "../store/slices/alertsSlice";
import { selectReadingsMap } from "../store/slices/readingsSlice";

export default function DashboardPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useQueryParam("status");
  const [searchQuery, setSearchQuery] = useQueryParam("q");
  const { target, deleting, error, requestDelete, cancelDelete, confirmDelete } = useDeleteEquipment();
  const [modalItem, setModalItem] = useState(undefined);

  const equipment = useSelector(selectAllEquipment);
  const counts = useSelector(selectStatusCounts);
  const activeAlerts = useSelector(selectActiveAlerts);
  const readings = useSelector(selectReadingsMap);

  const isFilterActive = Boolean(statusFilter || searchQuery.trim());
  const filteredEquipment = filterEquipment(equipment, statusFilter, searchQuery);
  const canEdit = isAdmin(user);

  const handleClearFilters = () => {
    setStatusFilter(null);
    setSearchQuery(null);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="LIVE FLEET STATUS"
        title="Equipment"
        highlight="Intelligence"
        subtitle={`${equipment.length} machines monitored in real time across all plant facilities.`}
      />

      <StatusSummary
        counts={counts}
        selectedStatus={statusFilter}
        onSelectStatus={(s) => setStatusFilter(statusFilter === s ? null : s)}
      />

      <Card
        title="Equipment fleet"
        description="Search your machines, filter by status, open one to see live trends, or update its details."
      >
        <EquipmentToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearFilters={handleClearFilters}
          canAdd={canEdit}
          onAdd={() => setModalItem(null)}
          filteredCount={filteredEquipment.length}
          totalCount={equipment.length}
          isFilterActive={isFilterActive}
        />

        <EquipmentTable
          equipment={filteredEquipment}
          readings={readings}
          activeAlerts={activeAlerts}
          onSelect={(id) => navigate(`/equipment/${id}`)}
          onEdit={(item) => setModalItem(item)}
          onDelete={requestDelete}
          emptyMessage={equipment.length === 0 ? "No equipment registered yet." : "No equipment matches the search or filter criteria."}
          emptyAction={
            equipment.length === 0
              ? canEdit && <Button variant="primary" onClick={() => setModalItem(null)}><Plus size={16} /> Add equipment</Button>
              : <Button variant="secondary" onClick={handleClearFilters}>Clear filters</Button>
          }
        />
      </Card>

      {modalItem !== undefined && canEdit && (
        <EquipmentForm
          item={modalItem}
          onClose={() => setModalItem(undefined)}
          onSave={(item) => dispatch(saveEquipment(item)).unwrap()}
        />
      )}

      {target && canEdit && (
        <ConfirmDialog
          title="Delete equipment"
          message={`Delete "${target.name}"? Its readings and alert history will also be permanently removed. This cannot be undone.`}
          loading={deleting}
          error={error}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
