import { describe, it, expect } from "vitest";
import { rowsFromHistory } from "./readings";

describe("rowsFromHistory", () => {
  it("keeps the previous value when a metric is missing", () => {
    const history = [
      { timestamp: "2026-10-04T10:00:00Z", metric: "temperature", value: 75 },
      { timestamp: "2026-10-04T10:00:00Z", metric: "vibration", value: 2.5 },
      { timestamp: "2026-10-04T10:00:02Z", metric: "temperature", value: 80 },
    ];

    const rows = rowsFromHistory(history);

    expect(rows).toHaveLength(2);
    expect(rows[0].temperature).toBe(75);
    expect(rows[0].vibration).toBe(2.5);

    expect(rows[1].temperature).toBe(80);
    expect(rows[1].vibration).toBe(2.5); // carried forward from previous row
  });
});
