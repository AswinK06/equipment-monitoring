// IoT Equipment Sensor Telemetry Simulator
// Supports dynamic auto-discovery (AUTO_DISCOVER=true) and status-based telemetry rules.
const mqtt = require("mqtt");

const URL = process.env.MQTT_URL || "mqtt://localhost:1883";
const API_BASE = process.env.API_BASE || "http://localhost:5000";
const AUTO_DISCOVER = process.env.AUTO_DISCOVER === "true";
const INTERVAL = Number(process.env.INTERVAL_MS || 2000);
const FALLBACK_IDS = (process.env.EQUIPMENT_IDS || "1,2,3,4").split(",").map(Number);

// Default baseline profiles for machines
const PROFILES = {
  1: { temperature: 83, vibration: 6.4, pressure: 112 },
  2: { temperature: 61, vibration: 3.1, pressure: 95 },
  3: { temperature: 68, vibration: 4.0, pressure: 105 },
  4: { temperature: 38, vibration: 0.6, pressure: 40 },
  5: { temperature: 38, vibration: 0.6, pressure: 40 },
  6: { temperature: 38, vibration: 0.6, pressure: 40 },
};
const FALLBACK_PROFILE = { temperature: 65, vibration: 3.2, pressure: 95 };

// In-memory runtime counter per equipment
const runtime = {};
FALLBACK_IDS.forEach((id) => {
  runtime[id] = 1000 + id * 300;
});

const jitter = (v, k) => v + (Math.random() * 2 - 1) * k;

// Local registry of monitored equipment: id -> { id, status, name, type }
let monitoredEquipment = new Map();

// Initialize default inventory when AUTO_DISCOVER is false
if (!AUTO_DISCOVER) {
  FALLBACK_IDS.forEach((id) => {
    monitoredEquipment.set(id, {
      id,
      name: `Equipment #${id}`,
      status: id === 4 ? "Idle" : id === 5 ? "UnderMaintenance" : "Active",
    });
  });
}

// Auto-discovery: Polls API every 5 seconds to sync inventory
let authToken = null;
async function fetchAuthToken() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "viewer@sustainabyte.local", password: "ViewerPassword123!" }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.accessToken;
  } catch {
    return null;
  }
}

async function syncInventory() {
  try {
    // Attempt anonymous inventory endpoint first
    let res = await fetch(`${API_BASE}/api/equipment/inventory`);
    if (!res.ok && res.status !== 404) {
      if (!authToken) authToken = await fetchAuthToken();
      res = await fetch(`${API_BASE}/api/equipment`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      if (res.status === 401) {
        authToken = await fetchAuthToken();
        res = await fetch(`${API_BASE}/api/equipment`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        });
      }
    }

    if (res.ok) {
      const items = await res.json();
      const updated = new Map();
      for (const eq of items) {
        updated.set(eq.id, eq);
        if (runtime[eq.id] == null) {
          runtime[eq.id] = 1000 + eq.id * 250;
        }
      }
      monitoredEquipment = updated;
    }
  } catch (err) {
    // Backend may still be starting up; will retry on next poll interval
  }
}

if (AUTO_DISCOVER) {
  console.log(`Auto-discovery enabled: polling ${API_BASE}/api/equipment every 5s`);
  syncInventory();
  setInterval(syncInventory, 5000);
}

const client = mqtt.connect(URL, { reconnectPeriod: 2000 });
client.on("connect", () => {
  console.log(`Connected to MQTT broker at ${URL}`);
});
client.on("error", (e) => console.error("MQTT error:", e.message));

// Generate readings payload according to equipment status
function generateTelemetry(id, status) {
  const normStatus = (status || "Active").replace(/\s+/g, "");

  // 1. Faulty or Under Maintenance: DO NOT publish live metrics
  if (normStatus === "Faulty" || normStatus === "UnderMaintenance") {
    return null;
  }

  // 2. Idle: low baseline readings with stationary runtime
  if (normStatus === "Idle") {
    return [
      { metric: "temperature", value: +jitter(26, 1.2).toFixed(2), unit: "°C" },
      { metric: "vibration", value: +Math.max(0, jitter(0.08, 0.04)).toFixed(2), unit: "mm/s" },
      { metric: "pressure", value: +jitter(14.7, 0.5).toFixed(2), unit: "psi" },
      { metric: "runtime", value: +(runtime[id] || 1000).toFixed(3), unit: "h" },
    ];
  }

  // 3. Active: live dynamic operating metrics with operational spikes
  const p = PROFILES[id] || FALLBACK_PROFILE;
  const spike = Math.random() < 0.04;
  runtime[id] = (runtime[id] || 1000) + INTERVAL / 3600000;

  return [
    { metric: "temperature", value: +(jitter(p.temperature, 2.5) + (spike ? 14 : 0)).toFixed(2), unit: "°C" },
    { metric: "vibration", value: +Math.max(0, jitter(p.vibration, 0.5) + (spike ? 2 : 0)).toFixed(2), unit: "mm/s" },
    { metric: "pressure", value: +jitter(p.pressure, 4).toFixed(2), unit: "psi" },
    { metric: "runtime", value: +runtime[id].toFixed(3), unit: "h" },
  ];
}

// Concurrent broadcast loop: publishes all machines simultaneously per tick
setInterval(async () => {
  if (!client.connected || monitoredEquipment.size === 0) return;

  const timestamp = new Date().toISOString();
  const publishJobs = [];

  for (const [id, eq] of monitoredEquipment.entries()) {
    const readings = generateTelemetry(id, eq.status);
    if (!readings) continue; // Skip Faulty & Under Maintenance machines

    const payload = JSON.stringify({ timestamp, readings });
    publishJobs.push(
      new Promise((resolve) => {
        client.publish(`equipment/${id}/readings`, payload, { qos: 0 }, resolve);
      })
    );
  }

  if (publishJobs.length > 0) {
    await Promise.all(publishJobs);
  }
}, INTERVAL);
