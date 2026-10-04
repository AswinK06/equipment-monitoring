const API_BASE = process.env.API_BASE || "http://localhost:5000";
const MQTT_URL = process.env.MQTT_URL || "mqtt://localhost:1883";
const INTERVAL_MS = Number(process.env.INTERVAL_MS || 2000);
const SYNC_INTERVAL_MS = Number(process.env.SYNC_INTERVAL_MS || 30000);
const SIM_EMAIL = process.env.SIM_EMAIL;
const SIM_PASSWORD = process.env.SIM_PASSWORD;

if (!SIM_EMAIL || !SIM_PASSWORD) {
  console.error("Set SIM_EMAIL and SIM_PASSWORD (a Viewer account is enough).");
  process.exit(1);
}

module.exports = {
  API_BASE,
  MQTT_URL,
  INTERVAL_MS,
  SYNC_INTERVAL_MS,
  SIM_EMAIL,
  SIM_PASSWORD,
};
