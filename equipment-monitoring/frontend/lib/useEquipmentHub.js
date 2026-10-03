"use client";
import { useCallback, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { API, api } from "./api";

const label = (iso) => new Date(iso).toLocaleTimeString([], { hour12: false });
const toEq = (e) => ({ ...e, status: e.status === "UnderMaintenance" ? "Under Maintenance" : e.status });
const toApiStatus = (s) => s.replace(" ", "");
const toAlert = (a) => ({ ...a, time: label(a.createdAt) });

// One chart/table row per MQTT message; metrics missing from a message carry forward from the previous row.
const addSample = (rows, ts, metrics) => [...rows, { ...(rows.at(-1) || {}), ...metrics, ts, t: label(ts) }].slice(-60);
const rowsFromHistory = (list) => {
  const byTs = new Map();
  list.forEach((r) => byTs.set(r.timestamp, { ...(byTs.get(r.timestamp) || {}), [r.metric]: r.value }));
  return [...byTs].reduce((rows, [ts, m]) => addSample(rows, ts, m), []);
};

/** Loads data over REST, then keeps it fresh from SignalR events (ReadingsReceived, AlertTriggered, AlertUpdated). */
export function useEquipmentHub() {
  const [db, setDb] = useState({ equipment: [], readings: {}, alerts: [] });
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const [eq, al] = await Promise.all([api("/api/equipment"), api("/api/alerts")]);
        const hist = await Promise.all(eq.map((e) => api(`/api/equipment/${e.id}/readings?limit=200`)));
        if (off) return;
        setDb({
          equipment: eq.map(toEq),
          alerts: al.map(toAlert),
          readings: Object.fromEntries(eq.map((e, i) => [e.id, rowsFromHistory(hist[i])])),
        });
        setError(null);
      } catch (e) {
        if (!off) setError(e.message);
      } finally {
        if (!off) setLoading(false);
      }
    })();

    const conn = new signalR.HubConnectionBuilder().withUrl(`${API}/hubs/equipment`).withAutomaticReconnect().build();
    conn.on("ReadingsReceived", (m) =>
      setDb((d) => ({
        ...d,
        readings: {
          ...d.readings,
          [m.equipmentId]: addSample(d.readings[m.equipmentId] || [], m.timestamp, Object.fromEntries(m.readings.map((r) => [r.metric, r.value]))),
        },
      }))
    );
    conn.on("AlertTriggered", (a) => setDb((d) => (d.alerts.some((x) => x.id === a.id) ? d : { ...d, alerts: [toAlert(a), ...d.alerts] })));
    conn.on("AlertUpdated", (a) => setDb((d) => ({ ...d, alerts: d.alerts.map((x) => (x.id === a.id ? toAlert(a) : x)) })));
    conn.onreconnecting(() => setLive(false));
    conn.onreconnected(() => setLive(true));

    const start = async () => {
      try {
        await conn.start();
        if (!off) setLive(true);
      } catch {
        if (!off) setTimeout(start, 3000);
      }
    };
    conn.onclose(() => { if (!off) { setLive(false); setTimeout(start, 3000); } });
    start();
    return () => { off = true; conn.stop(); };
  }, []);

  const setAlert = useCallback(async (id, status) => {
    try {
      const a = await api(`/api/alerts/${id}/${status === "Resolved" ? "resolve" : "acknowledge"}`, { method: "PATCH" });
      setDb((d) => ({ ...d, alerts: d.alerts.map((x) => (x.id === id ? toAlert(a) : x)) }));
      setError(null);
    } catch (e) { setError(e.message); }
  }, []);

  const save = useCallback(async (eq) => {
    const body = JSON.stringify({ name: eq.name, type: eq.type, location: eq.location, status: toApiStatus(eq.status), installedDate: eq.installedDate });
    try {
      const saved = toEq(await api(eq.id ? `/api/equipment/${eq.id}` : "/api/equipment", { method: eq.id ? "PUT" : "POST", body }));
      setDb((d) => ({ ...d, equipment: eq.id ? d.equipment.map((x) => (x.id === saved.id ? saved : x)) : [...d.equipment, saved] }));
      setError(null);
    } catch (e) { setError(e.message); }
  }, []);

  return { db, live, loading, error, setAlert, save };
}
