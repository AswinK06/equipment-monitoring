const mqtt = require("mqtt");
const { MQTT_URL, INTERVAL_MS, SYNC_INTERVAL_MS } = require("./config");
const { fetchEquipment } = require("./apiClient");
const { generateReadings } = require("./telemetry");

const runtimeMap = new Map();
let equipmentMap = new Map();
let lastTrackedCount = -1;

function updateInventory(items) {
  const nextMap = new Map();
  const validIds = new Set();

  for (const item of items) {
    nextMap.set(item.id, item);
    validIds.add(item.id);
    if (!runtimeMap.has(item.id)) {
      runtimeMap.set(item.id, 1000 + Math.random() * 500);
    }
  }

  for (const id of runtimeMap.keys()) {
    if (!validIds.has(id)) {
      runtimeMap.delete(id);
    }
  }

  equipmentMap = nextMap;
  if (equipmentMap.size !== lastTrackedCount) {
    lastTrackedCount = equipmentMap.size;
    console.log(`Tracking ${lastTrackedCount} machines`);
  }
}

async function syncInventory() {
  try {
    const items = await fetchEquipment();
    updateInventory(items);
  } catch (err) {
    console.warn(`Inventory sync warning: ${err.message}`);
  }
}

async function waitForInitialInventory() {
  while (true) {
    try {
      const items = await fetchEquipment();
      updateInventory(items);
      return;
    } catch {
      console.warn("API not reachable yet. Retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

function advanceRuntime(equipment) {
  const current = runtimeMap.get(equipment.id) || 1000;
  const status = (equipment.status || "Active").replace(/\s+/g, "");
  if (status === "Active" || status === "Faulty") {
    const updated = current + INTERVAL_MS / 3600000;
    runtimeMap.set(equipment.id, updated);
    return updated;
  }
  return current;
}

function publishTelemetry(client) {
  if (!client.connected || equipmentMap.size === 0) return;

  const timestamp = new Date().toISOString();
  for (const eq of equipmentMap.values()) {
    const runtime = advanceRuntime(eq);
    const readings = generateReadings(eq, runtime);
    if (!readings) continue;

    const payload = JSON.stringify({ timestamp, readings });
    client.publish(`equipment/${eq.id}/readings`, payload, { qos: 0 });
  }
}

async function start() {
  await waitForInitialInventory();
  setInterval(syncInventory, SYNC_INTERVAL_MS);

  const client = mqtt.connect(MQTT_URL, { reconnectPeriod: 2000 });
  client.on("connect", () => console.log("Connected to MQTT broker"));
  client.on("error", (e) => console.warn(`MQTT warning: ${e.message}`));

  setInterval(() => publishTelemetry(client), INTERVAL_MS);
}

start();
