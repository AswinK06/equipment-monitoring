import { describe, it, expect } from "vitest";
import readingsReducer, { readingsReceived } from "./readingsSlice";

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
});
