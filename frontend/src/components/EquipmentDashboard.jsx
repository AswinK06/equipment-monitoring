import { useState } from "react";
import { useEquipmentData } from "../hooks/useEquipmentData";
import { STATUSES, STATUS_COLORS } from "../constants/statuses";
import Button from "./Button";
import StatusBadge from "./StatusBadge";
import StatCard from "./StatCard";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";
import EmptyState from "./EmptyState";
import EquipmentTable from "./EquipmentTable";
import EquipmentForm from "./EquipmentForm";
import MetricTabs from "./MetricTabs";
import MetricChart from "./MetricChart";
import ReadingsTable from "./ReadingsTable";
import AlertHistoryList from "./AlertHistoryList";
import AlertCard from "./AlertCard";
import PageHeader from "./PageHeader";
import { ArrowLeft, Plus, Pencil } from "lucide-react";

/* ---------- views ---------- */
function DashboardView({ db, openAlerts, counts, onSelect, onEdit, onAdd }) {
  const [filter, setFilter] = useState(null);
  const filteredEquipment = db.equipment.filter((e) => !filter || e.status === filter);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-brand-green">LIVE FLEET STATUS</p>
          <h1 className="text-3xl font-extrabold text-brand-navy">
            Equipment <span className="text-brand-green">Intelligence</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {db.equipment.length} machines across all plants. Values update live.
          </p>
        </div>
        <Button variant="primary" onClick={onAdd}>
          <Plus size={16} /> Add equipment
        </Button>
      </div>

      {/* Row of StatCards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

      <EquipmentTable
        equipment={filteredEquipment}
        readings={db.readings}
        activeAlerts={openAlerts}
        onSelect={onSelect}
        onEdit={onEdit}
      />
    </div>
  );
}

function DetailView({ db, id, onBack, onEdit }) {
  const [metric, setMetric] = useState("temperature");
  const equipment = db.equipment.find((x) => x.id === id);
  if (!equipment) return null;

  const history = db.readings[id] || [];
  const latest = history.at(-1) || {};
  const alertHistory = db.alerts.filter((a) => a.equipmentId === id);

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-navy transition-colors"
      >
        <ArrowLeft size={16} /> Back to fleet
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-navy">{equipment.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {equipment.type} · {equipment.location} · Installed {equipment.installedDate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={equipment.status} />
          <Button variant="secondary" onClick={() => onEdit(equipment)}>
            <Pencil size={14} /> Edit
          </Button>
        </div>
      </div>

      <MetricTabs latest={latest} selectedMetric={metric} onSelect={setMetric} />

      <MetricChart data={history} metric={metric} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
            Recent Telemetry
          </h3>
          <ReadingsTable rows={history} />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
            Alert History
          </h3>
          <AlertHistoryList alerts={alertHistory} />
        </div>
      </div>
    </div>
  );
}

function AlertsView({ db, openAlerts, onAcknowledge, onResolve, onSelect }) {
  const eqMap = Object.fromEntries(db.equipment.map((e) => [e.id, e.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SYSTEM HEALTH"
        title="Active"
        highlight="alerts"
        subtitle="Unresolved threshold breaches requiring operator attention."
      />

      {openAlerts.length === 0 ? (
        <EmptyState message="All systems operational. No active breaches detected." />
      ) : (
        <div className="space-y-3">
          {openAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              equipmentName={eqMap[alert.equipmentId]}
              onAcknowledge={onAcknowledge}
              onResolve={onResolve}
              onOpen={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- app shell ---------- */
export default function EquipmentDashboard() {
  const { db, live, loading, error, setAlert, save } = useEquipmentData();
  const [page, setPage] = useState("dashboard"); // "dashboard" | "detail" | "alerts"
  const [selectedId, setSelectedId] = useState(null);
  const [modalItem, setModalItem] = useState(undefined);

  const openAlerts = db.alerts.filter((a) => a.status !== "Resolved");
  const counts = Object.fromEntries(
    STATUSES.map((s) => [s, db.equipment.filter((e) => e.status === s).length])
  );

  const handleSelect = (id) => {
    setSelectedId(id);
    setPage("detail");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-brand-navy">
      <Navbar
        activePage={page}
        alertCount={openAlerts.length}
        isLive={live}
        onNavigate={(p) => setPage(p)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <ErrorMessage message={error} />

        {loading ? (
          <Loading />
        ) : (
          <>
            {page === "dashboard" && (
              <DashboardView
                db={db}
                openAlerts={openAlerts}
                counts={counts}
                onSelect={handleSelect}
                onEdit={(item) => setModalItem(item)}
                onAdd={() => setModalItem(null)}
              />
            )}

            {page === "detail" && (
              <DetailView
                db={db}
                id={selectedId}
                onBack={() => setPage("dashboard")}
                onEdit={(item) => setModalItem(item)}
              />
            )}

            {page === "alerts" && (
              <AlertsView
                db={db}
                openAlerts={openAlerts}
                onAcknowledge={(id) => setAlert(id, "Acknowledged")}
                onResolve={(id) => setAlert(id, "Resolved")}
                onSelect={handleSelect}
              />
            )}
          </>
        )}
      </main>

      <Footer />

      {modalItem !== undefined && (
        <EquipmentForm
          item={modalItem}
          onClose={() => setModalItem(undefined)}
          onSave={save}
        />
      )}
    </div>
  );
}