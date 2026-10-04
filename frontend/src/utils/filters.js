export function filterEquipment(equipment = [], status, query) {
  return equipment.filter((e) => {
    if (status && e.status !== status) return false;
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      const nameMatch = (e.name || "").toLowerCase().includes(q);
      const typeMatch = (e.type || "").toLowerCase().includes(q);
      const locMatch = (e.location || "").toLowerCase().includes(q);
      if (!nameMatch && !typeMatch && !locMatch) return false;
    }
    return true;
  });
}
