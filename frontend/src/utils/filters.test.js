import { describe, it, expect } from "vitest";
import { filterEquipment } from "./filters";

describe("filterEquipment", () => {
  const sampleEquipment = [
    {
      id: 1,
      name: "Generator Alpha",
      type: "Generator",
      location: "Plant 1 · Bay 2",
      status: "Active",
    },
    {
      id: 2,
      name: "Hydraulic Pump #2",
      type: "Pump",
      location: "Plant 1 · Bay 4",
      status: "Faulty",
    },
    {
      id: 3,
      name: "Compressor C-7",
      type: "Compressor",
      location: "Plant 2 · Utility",
      status: "Idle",
    },
    {
      id: 4,
      name: "Cooling Fan F-3",
      type: "Fan",
      location: "Plant 1 · Roof",
      status: "Under Maintenance",
    },
  ];

  it("returns all equipment when status and query are not provided", () => {
    const result = filterEquipment(sampleEquipment, null, null);
    expect(result).toHaveLength(4);
  });

  it("filters by status", () => {
    const result = filterEquipment(sampleEquipment, "Active", "");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("filters by query matching name case-insensitively", () => {
    const result = filterEquipment(sampleEquipment, null, "alpha");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Generator Alpha");
  });

  it("filters by query matching type case-insensitively", () => {
    const result = filterEquipment(sampleEquipment, null, "PUMP");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it("filters by query matching location case-insensitively", () => {
    const result = filterEquipment(sampleEquipment, null, "Roof");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it("filters by both status and query", () => {
    const result = filterEquipment(sampleEquipment, "Faulty", "Pump");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);

    const emptyResult = filterEquipment(sampleEquipment, "Active", "Pump");
    expect(emptyResult).toHaveLength(0);
  });
});
