import { useEffect, useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { useSignalR } from "../../hooks/useSignalR";
import { fetchEquipment } from "../../store/slices/equipmentSlice";
import { fetchAlerts, alertReceived, alertUpdated, toAlert } from "../../store/slices/alertsSlice";
import { fetchReadings, readingsReceived } from "../../store/slices/readingsSlice";
import Sidebar from "./Sidebar";
import PageToolbar from "./PageToolbar";
import Footer from "./Footer";
import Loading from "../ui/Loading";
import ErrorMessage from "../ui/ErrorMessage";

export default function AppLayout() {
  const { token, user } = useAuth();
  const dispatch = useDispatch();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebarCollapsed", String(next));
      } catch {}
      return next;
    });
  };

  const loading = useSelector((state) => state.equipment.loading);
  const equipmentError = useSelector((state) => state.equipment.error);
  const alertsError = useSelector((state) => state.alerts.error);
  const readingsError = useSelector((state) => state.readings.error);
  const error = equipmentError || alertsError || readingsError || null;

  const accessTokenFactory = useCallback(() => token, [token]);

  const { isLive } = useSignalR({
    onReadingsReceived: (data) => dispatch(readingsReceived(data)),
    onAlertTriggered: (data) => dispatch(alertReceived(toAlert(data))),
    onAlertUpdated: (data) => dispatch(alertUpdated(toAlert(data))),
    accessTokenFactory,
  });

  useEffect(() => {
    dispatch(fetchAlerts());
    dispatch(fetchEquipment())
      .unwrap()
      .then((items) => {
        if (Array.isArray(items)) {
          items.forEach((item) => {
            dispatch(fetchReadings(item.id));
          });
        }
      })
      .catch(() => {});
  }, [dispatch]);

  return (
    <div className="flex min-h-screen bg-slate-100/80 text-slate-800 font-sans antialiased selection:bg-brand-mint selection:text-brand-navy">
      {/* Desktop Sidebar (visible on lg+) */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggle={handleToggleCollapse}
        />
      </div>

      {/* Mobile Drawer (visible on <lg) */}
      <div className="lg:hidden">
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-brand-navy/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            collapsed={false}
            onCloseMobile={() => setMobileOpen(false)}
          />
        </div>
      </div>

      {/* Main Column */}
      <div className="min-w-0 flex-1 flex flex-col">
        <PageToolbar
          isLive={isLive}
          onMenuClick={() => setMobileOpen(true)}
          user={user}
        />

        {/* Page Content */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-10xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
            <ErrorMessage message={error} />

            {loading ? (
              <Loading text="Loading industrial equipment fleet…" />
            ) : (
              <Outlet />
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
