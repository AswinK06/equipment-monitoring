import { useCallback, useEffect, useState } from "react";
import { getEquipment, updateEquipment, createEquipment, getReadings } from "../api/equipmentApi";
import { getAlerts, acknowledgeAlert, resolveAlert } from "../api/alertsApi";
import { formatTime } from "../utils/format";
import { rowsFromHistory, addSample } from "../utils/readings";
import { useSignalR } from "./useSignalR";

const toEq = (e) => ({
  ...e,
  status: e.status === "UnderMaintenance" ? "Under Maintenance" : e.status,
});

const toApiStatus = (s) => s.replace(" ", "");

const toAlert = (a) => ({
  ...a,
  time: formatTime(a.createdAt),
});

/** Loads data over REST via API modules, then keeps it fresh from SignalR events. */
export function useEquipmentData(accessTokenFactory) {
  const [db, setDb] = useState({ equipment: [], readings: {}, alerts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleReadingsReceived = useCallback((m) => {
    setDb((d) => ({
      ...d,
      readings: {
        ...d.readings,
        [m.equipmentId]: addSample(
          d.readings[m.equipmentId] || [],
          m.timestamp,
          Object.fromEntries(m.readings.map((r) => [r.metric, r.value]))
        ),
      },
    }));
  }, []);

  const handleAlertTriggered = useCallback((a) => {
    setDb((d) =>
      d.alerts.some((x) => x.id === a.id) ? d : { ...d, alerts: [toAlert(a), ...d.alerts] }
    );
  }, []);

  const handleAlertUpdated = useCallback((a) => {
    setDb((d) => ({
      ...d,
      alerts: d.alerts.map((x) => (x.id === a.id ? toAlert(a) : x)),
    }));
  }, []);

  const { isLive } = useSignalR({
    onReadingsReceived: handleReadingsReceived,
    onAlertTriggered: handleAlertTriggered,
    onAlertUpdated: handleAlertUpdated,
    accessTokenFactory,
  });

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [eq, al] = await Promise.all([getEquipment(), getAlerts()]);
      const hist = await Promise.all(eq.map((e) => getReadings(e.id, 200)));

      setDb({
        equipment: eq.map(toEq),
        alerts: al.map(toAlert),
        readings: Object.fromEntries(eq.map((e, i) => [e.id, rowsFromHistory(hist[i])])),
      });
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const setAlert = useCallback(async (id, status) => {
    try {
      const a = status === "Resolved" ? await resolveAlert(id) : await acknowledgeAlert(id);
      setDb((d) => ({
        ...d,
        alerts: d.alerts.map((x) => (x.id === id ? toAlert(a) : x)),
      }));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const save = useCallback(async (eq) => {
    const payload = {
      name: eq.name,
      type: eq.type,
      location: eq.location,
      status: toApiStatus(eq.status),
      installedDate: eq.installedDate,
    };
    try {
      const savedRaw = eq.id ? await updateEquipment(eq.id, payload) : await createEquipment(payload);
      const saved = toEq(savedRaw);
      setDb((d) => ({
        ...d,
        equipment: eq.id
          ? d.equipment.map((x) => (x.id === saved.id ? saved : x))
          : [...d.equipment, saved],
      }));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  return { db, live: isLive, loading, error, setAlert, save, reload: loadAll };
}
