import { api } from "./client";

export async function getEquipment() {
  return api("/api/equipment");
}

export async function getEquipmentById(id) {
  return api(`/api/equipment/${id}`);
}

export async function createEquipment(data) {
  return api("/api/equipment", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEquipment(id, data) {
  return api(`/api/equipment/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEquipment(id) {
  return api(`/api/equipment/${id}`, {
    method: "DELETE",
  });
}

export async function getReadings(id, limit = 200, from, to, metric) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (metric) params.set("metric", metric);
  const query = params.toString() ? `?${params.toString()}` : "";
  return api(`/api/equipment/${id}/readings${query}`);
}
