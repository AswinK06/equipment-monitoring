import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card component", () => {
  it("renders title, description, actions, and children", () => {
    render(
      <Card
        title="Fleet Overview"
        description="Active industrial fleet units"
        actions={<button>Add Unit</button>}
      >
        <div>Fleet Table Content</div>
      </Card>
    );

    expect(screen.getByText("Fleet Overview")).toBeInTheDocument();
    expect(screen.getByText("Active industrial fleet units")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Unit" })).toBeInTheDocument();
    expect(screen.getByText("Fleet Table Content")).toBeInTheDocument();
  });
});
