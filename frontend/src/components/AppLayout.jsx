import { useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { useSignalR } from "../hooks/useSignalR";
import { fetchEquipment } from "../store/slices/equipmentSlice";
import { fetchAlerts, alertReceived, alertUpdated, toAlert } from "../store/slices/alertsSlice";
import { fetchReadings, readingsReceived } from "../store/slices/readingsSlice";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";

export default function AppLayout() {
  const { token } = useAuth();
  const dispatch = useDispatch();

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
    <div className="flex min-h-screen flex-col bg-white text-brand-navy font-sans antialiased selection:bg-brand-mint selection:text-brand-navy">
      <Navbar isLive={isLive} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <ErrorMessage message={error} />

        {loading ? (
          <Loading text="Loading industrial equipment fleet…" />
        ) : (
          <Outlet />
        )}
      </main>

      <Footer />
    </div>
  );
}
