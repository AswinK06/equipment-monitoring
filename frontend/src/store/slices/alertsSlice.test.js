import { describe, it, expect } from "vitest";
import alertsReducer, { alertReceived, alertUpdated } from "./alertsSlice";
import { removeEquipment } from "./equipmentSlice";

describe("alertsSlice reducer", () => {
  it("alertReceived adds an alert", () => {
    const initialState = { items: [], loading: false, error: null };
    const alert = { id: 1, equipmentId: 10, status: "Open" };

    const state = alertsReducer(initialState, alertReceived(alert));

    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(alert);
  });

  it("alertReceived with an existing id does not add a duplicate", () => {
    const alert1 = { id: 1, equipmentId: 10, status: "Open" };
    const initialState = { items: [alert1], loading: false, error: null };

    const duplicateAlert = { id: 1, equipmentId: 10, status: "Open" };
    const state = alertsReducer(initialState, alertReceived(duplicateAlert));

    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(alert1);
  });

  it("alertUpdated changes the status", () => {
    const alert = { id: 1, equipmentId: 10, status: "Open" };
    const initialState = { items: [alert], loading: false, error: null };

    const updated = { id: 1, equipmentId: 10, status: "Acknowledged" };
    const state = alertsReducer(initialState, alertUpdated(updated));

    expect(state.items).toHaveLength(1);
    expect(state.items[0].status).toBe("Acknowledged");
  });

  it("removeEquipment.fulfilled removes only that machine's alerts", () => {
    const initialState = {
      items: [
        { id: 1, equipmentId: 10, status: "Open" },
        { id: 2, equipmentId: 20, status: "Open" },
        { id: 3, equipmentId: 10, status: "Acknowledged" },
      ],
      loading: false,
      error: null,
    };

    const state = alertsReducer(initialState, removeEquipment.fulfilled(10, "req-1", 10));

    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe(2);
    expect(state.items[0].equipmentId).toBe(20);
  });
});
