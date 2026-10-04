import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "./RegisterPage";
import * as useAuthModule from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("RegisterPage", () => {
  it("shows 'Passwords do not match' and does not call the API when the two passwords differ", () => {
    const mockRegister = vi.fn();
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      token: null,
      register: mockRegister,
      authError: "",
    });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: "test@sustainabyte.local" },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "DifferentPassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });
});
