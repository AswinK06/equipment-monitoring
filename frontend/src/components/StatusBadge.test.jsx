import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";
import { STATUSES } from "../constants/statuses";

describe("StatusBadge", () => {
  STATUSES.forEach((status) => {
    it(`shows the status text for ${status}`, () => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    });
  });
});
