import { useState } from "react";
import { useEquipmentData } from "./hooks/useEquipmentData";
import { STATUSES } from "./constants/statuses";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loading from "./components/Loading";
import ErrorMessage from "./components/ErrorMessage";
import DashboardPage from "./pages/DashboardPage";
import EquipmentDetailPage from "./pages/EquipmentDetailPage";
import AlertsPage from "./pages/AlertsPage";

export default function App() {
  const { db, live, loading, error, setAlert, save } = useEquipmentData();
  const [page, setPage] = useState("dashboard"); // "dashboard" | "detail" | "alerts"
  const [selectedId, setSelectedId] = useState(null);

  const openAlerts = db.alerts.filter((a) => a.status !== "Resolved");
  const counts = Object.fromEntries(
    STATUSES.map((s) => [s, db.equipment.filter((e) => e.status === s).length])
  );

  const handleSelectEquipment = (id) => {
    setSelectedId(id);
    setPage("detail");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-brand-navy font-sans antialiased selection:bg-brand-mint selection:text-brand-navy">
      <Navbar
        activePage={page}
        alertCount={openAlerts.length}
        isLive={live}
        onNavigate={(targetPage) => setPage(targetPage)}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <ErrorMessage message={error} />

        {loading ? (
          <Loading text="Loading industrial equipment fleet…" />
        ) : (
          <>
            {page === "dashboard" && (
              <DashboardPage
                db={db}
                openAlerts={openAlerts}
                counts={counts}
                onSelect={handleSelectEquipment}
                onSave={save}
              />
            )}

            {page === "detail" && (
              <EquipmentDetailPage
                db={db}
                id={selectedId}
                onBack={() => setPage("dashboard")}
                onSave={save}
              />
            )}

            {page === "alerts" && (
              <AlertsPage
                db={db}
                openAlerts={openAlerts}
                onAcknowledge={(id) => setAlert(id, "Acknowledged")}
                onResolve={(id) => setAlert(id, "Resolved")}
                onSelectEquipment={handleSelectEquipment}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
