import { api } from "./client";

export async function getAlerts(activeOnly = false, equipmentId = null) {
  const params = new URLSearchParams();
  if (activeOnly) params.set("activeOnly", "true");
  if (equipmentId != null) params.set("equipmentId", equipmentId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return api(`/api/alerts${query}`);
}

export async function acknowledgeAlert(id) {
  return api(`/api/alerts/${id}/acknowledge`, { method: "PATCH" });
}

export async function resolveAlert(id) {
  return api(`/api/alerts/${id}/resolve`, { method: "PATCH" });
}
