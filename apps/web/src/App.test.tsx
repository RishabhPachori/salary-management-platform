import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = String(input);

        if (url.includes("/api/employees?")) {
          return {
            ok: true,
            json: async () => ({
              items: [
                {
                  id: "employee-1",
                  employeeCode: "EMP-00001",
                  fullName: "Sophia Clark",
                  email: "sophia.clark@acme.test",
                  country: "Canada",
                  department: "Finance",
                  jobTitle: "Product Manager",
                  salary: 110110,
                  currency: "CAD",
                  dateOfJoining: "2024-01-15T00:00:00.000Z"
                }
              ],
              total: 1,
              page: 1,
              pageSize: 10
            })
          };
        }

        if (url.includes("/api/employees/insights/departments")) {
          return {
            ok: true,
            json: async () => []
          };
        }

        if (url.includes("/api/employees/insights/countries")) {
          return {
            ok: true,
            json: async () => []
          };
        }

        return {
          ok: true,
          json: async () => ({ status: "ok" })
        };
      })
    );
  });

  it("renders the main heading", () => {
    render(<App />);

    expect(screen.getByText("Salary Management Platform")).toBeInTheDocument();
  });

  it("renders fetched employee data in the table", async () => {
    render(<App />);

    expect(await screen.findByText("EMP-00001")).toBeInTheDocument();
    expect(screen.getAllByText("Sophia Clark")[0]).toBeInTheDocument();
    expect(screen.getByText("sophia.clark@acme.test")).toBeInTheDocument();
    expect(screen.getByText("CA$110,110")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Edit" })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Delete" })[0]).toBeInTheDocument();
  });

  it("shows validation messages when submitting an empty employee form", async () => {
    render(<App />);

    fireEvent.click(screen.getAllByRole("button", { name: "Add employee" })[0]);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create employee" })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("EMP-00001"), {
      target: { value: "EMP-" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter employee name"), {
      target: { value: "R" }
    });
    fireEvent.change(screen.getByPlaceholderText("name@acme.test"), {
      target: { value: "bad-email" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter job title"), {
      target: { value: "M" }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter salary"), {
      target: { value: "0" }
    });
    const comboboxes = screen.getAllByRole("combobox");

    fireEvent.change(comboboxes[2], {
      target: { value: "India" }
    });
    fireEvent.change(comboboxes[3], {
      target: { value: "Engineering" }
    });
    fireEvent.change(comboboxes[4], {
      target: { value: "INR" }
    });

    fireEvent.click(screen.getByRole("button", { name: "Create employee" }));

    expect(await screen.findByText("Use format like EMP-00001.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Salary must be greater than zero.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid job title.")).toBeInTheDocument();
  });
});
