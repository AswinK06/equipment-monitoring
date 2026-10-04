import { describe, it, expect } from "vitest";
import alertsReducer, { alertReceived, alertUpdated } from "./alertsSlice";

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
});
