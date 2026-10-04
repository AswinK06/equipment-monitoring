import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDialog from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("shows the message", () => {
    render(
      <ConfirmDialog
        title="Delete equipment"
        message="Delete 'Pump A'? Its readings and alert history will also be permanently removed."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText("Delete equipment")).toBeInTheDocument();
    expect(
      screen.getByText("Delete 'Pump A'? Its readings and alert history will also be permanently removed.")
    ).toBeInTheDocument();
  });

  it("Cancel calls onCancel and not onConfirm", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        title="Delete equipment"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it("Delete calls onConfirm", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmDialog
        title="Delete equipment"
        message="Are you sure?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleCancel).not.toHaveBeenCalled();
  });

  it("when loading both buttons are disabled and the label is 'Deleting…'", () => {
    render(
      <ConfirmDialog
        title="Delete equipment"
        message="Are you sure?"
        loading={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    const deleteButton = screen.getByRole("button", { name: "Deleting…" });

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it("shows the error text", () => {
    render(
      <ConfirmDialog
        title="Delete equipment"
        message="Are you sure?"
        error="Could not delete the equipment. Please try again."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(
      screen.getByText("Could not delete the equipment. Please try again.")
    ).toBeInTheDocument();
  });
});
