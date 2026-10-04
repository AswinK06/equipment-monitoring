import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AlertCard from "./AlertCard";

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: { email: "admin@sustainabyte.local", role: "Admin" },
    token: "fake-jwt",
  }),
}));

describe("AlertCard", () => {
  it("shows the Acknowledge button for an Open alert", () => {
    const openAlert = {
      id: 1,
      equipmentId: 10,
      metric: "temperature",
      kind: "Max",
      value: 95,
      threshold: 85,
      status: "Open",
      createdAt: "2026-10-04T10:00:00Z",
    };

    render(<AlertCard alert={openAlert} equipmentName="Pump 10" />);

    expect(screen.getByRole("button", { name: /acknowledge/i })).toBeInTheDocument();
  });

  it("hides the Acknowledge button for an Acknowledged alert", () => {
    const ackAlert = {
      id: 1,
      equipmentId: 10,
      metric: "temperature",
      kind: "Max",
      value: 95,
      threshold: 85,
      status: "Acknowledged",
      createdAt: "2026-10-04T10:00:00Z",
    };

    render(<AlertCard alert={ackAlert} equipmentName="Pump 10" />);

    expect(screen.queryByRole("button", { name: /acknowledge/i })).toBeNull();
    expect(screen.getByRole("button", { name: /resolve/i })).toBeInTheDocument();
  });
});
