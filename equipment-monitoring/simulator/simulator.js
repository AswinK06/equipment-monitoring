// Publishes one MQTT message per machine every INTERVAL_MS to equipment/{id}/readings.
// Machine 5 (Under Maintenance in the seed data) is left silent on purpose.
const mqtt = require("mqtt");

const URL = process.env.MQTT_URL || "mqtt://localhost:1883";
const IDS = (process.env.EQUIPMENT_IDS || "1,2,3,4").split(",").map(Number);
const INTERVAL = Number(process.env.INTERVAL_MS || 2000);

// Typical operating point per machine. #1 runs hot so it trips the 85°C limit now and then.
const PROFILES = {
  1: { temperature: 83, vibration: 6.4, pressure: 112 },
  2: { temperature: 61, vibration: 3.1, pressure: 95 },
  3: { temperature: 68, vibration: 4.0, pressure: 105 },
  4: { temperature: 38, vibration: 0.6, pressure: 40 },
};
const FALLBACK = { temperature: 60, vibration: 3, pressure: 90 };
const runtime = Object.fromEntries(IDS.map((id) => [id, 1000 + id * 300]));
const jitter = (v, k) => v + (Math.random() * 2 - 1) * k;

const client = mqtt.connect(URL, { reconnectPeriod: 2000 });
client.on("connect", () => console.log(`Connected to ${URL}; publishing for equipment ${IDS.join(", ")}`));
client.on("error", (e) => console.error("MQTT error:", e.message));

setInterval(() => {
  if (!client.connected) return;
  const timestamp = new Date().toISOString();
  for (const id of IDS) {
    const p = PROFILES[id] || FALLBACK;
    const spike = Math.random() < 0.04; // occasional abnormal reading
    runtime[id] += id === 4 ? 0 : INTERVAL / 3600000;
    const readings = [
      { metric: "temperature", value: +(jitter(p.temperature, 2.5) + (spike ? 14 : 0)).toFixed(2), unit: "°C" },
      { metric: "vibration", value: +Math.max(0, jitter(p.vibration, 0.5) + (spike ? 2 : 0)).toFixed(2), unit: "mm/s" },
      { metric: "pressure", value: +jitter(p.pressure, 4).toFixed(2), unit: "psi" },
      { metric: "runtime", value: +runtime[id].toFixed(3), unit: "h" },
    ];
    client.publish(`equipment/${id}/readings`, JSON.stringify({ timestamp, readings }));
  }
}, INTERVAL);
