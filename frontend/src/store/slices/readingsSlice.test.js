import { describe, it, expect } from "vitest";
import readingsReducer, { readingsReceived } from "./readingsSlice";
import { removeEquipment } from "./equipmentSlice";

describe("readingsSlice reducer", () => {
  it("readingsReceived adds a row, and after 70 calls only 60 rows remain", () => {
    let state = { byEquipmentId: {}, error: null };

    state = readingsReducer(
      state,
      readingsReceived({
        equipmentId: 1,
        timestamp: "2026-10-04T10:00:00Z",
        readings: [{ metric: "temperature", value: 50 }],
      })
    );

    expect(state.byEquipmentId[1]).toHaveLength(1);

    for (let i = 1; i < 70; i++) {
      state = readingsReducer(
        state,
        readingsReceived({
          equipmentId: 1,
          timestamp: `2026-10-04T10:00:${String(i).padStart(2, "0")}Z`,
          readings: [{ metric: "temperature", value: 50 + i }],
        })
      );
    }

    expect(state.byEquipmentId[1]).toHaveLength(60);
  });

  it("removeEquipment.fulfilled removes that machine's readings", () => {
    const initialState = {
      byEquipmentId: {
        1: [{ timestamp: "2026-10-04T10:00:00Z", temperature: 50 }],
        2: [{ timestamp: "2026-10-04T10:00:00Z", temperature: 60 }],
      },
      error: null,
    };

    const state = readingsReducer(initialState, removeEquipment.fulfilled(1, "req-1", 1));

    expect(state.byEquipmentId[1]).toBeUndefined();
    expect(state.byEquipmentId[2]).toBeDefined();
  });
});
