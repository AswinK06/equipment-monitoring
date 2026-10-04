import { describe, it, expect } from "vitest";
import equipmentReducer, {
  selectAllEquipment,
  saveEquipment,
  removeEquipment,
  toEquipment,
} from "./equipmentSlice";

describe("equipmentSlice", () => {
  it("selectAllEquipment sorts by updatedAt descending, then by id ascending", () => {
    const state = {
      equipment: {
        items: [
          { id: 1, name: "Pump A", updatedAt: "2026-10-04T10:00:00Z" },
          { id: 2, name: "Pump B", updatedAt: "2026-10-04T12:00:00Z" },
          { id: 3, name: "Pump C", updatedAt: "2026-10-04T11:00:00Z" },
          { id: 4, name: "Pump D", updatedAt: "2026-10-04T10:00:00Z" },
        ],
        loading: false,
        error: null,
      },
    };

    const sorted = selectAllEquipment(state);

    expect(sorted.map((e) => e.id)).toEqual([2, 3, 1, 4]);
  });

  it("saveEquipment.fulfilled replaces an existing item and selector orders it on top", () => {
    const initialState = {
      items: [
        { id: 1, name: "Pump A", updatedAt: "2026-10-04T10:00:00Z" },
        { id: 2, name: "Pump B", updatedAt: "2026-10-04T12:00:00Z" },
      ],
      loading: false,
      error: null,
    };

    const updatedItem = {
      id: 1,
      name: "Pump A (Updated)",
      updatedAt: "2026-10-04T13:00:00Z",
    };

    const nextState = {
      equipment: equipmentReducer(
        initialState,
        saveEquipment.fulfilled(updatedItem)
      ),
    };

    const sorted = selectAllEquipment(nextState);
    expect(sorted[0].id).toBe(1);
    expect(sorted[0].name).toBe("Pump A (Updated)");
  });

  it("removeEquipment.fulfilled removes the item", () => {
    const initialState = {
      items: [
        { id: 1, name: "Pump A", updatedAt: "2026-10-04T10:00:00Z" },
        { id: 2, name: "Pump B", updatedAt: "2026-10-04T12:00:00Z" },
      ],
      loading: false,
      error: null,
    };

    const state = equipmentReducer(initialState, removeEquipment.fulfilled(1, "req-1", 1));

    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe(2);
  });

  it("toEquipment preserves updatedAt", () => {
    const eq = {
      id: 1,
      name: "Generator",
      status: "UnderMaintenance",
      updatedAt: "2026-10-04T09:30:00Z",
    };
    const transformed = toEquipment(eq);
    expect(transformed.status).toBe("Under Maintenance");
    expect(transformed.updatedAt).toBe("2026-10-04T09:30:00Z");
  });
});
