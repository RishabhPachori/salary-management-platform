import { describe, expect, it, vi } from "vitest";
import { employeeService } from "./employee.service";
import { employeeRepository } from "./employee.repository";

vi.mock("./employee.repository", () => ({
  employeeRepository: {
    create: vi.fn(),
    list: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    salaryRowsByCountry: vi.fn(),
    averageSalaryByRole: vi.fn(),
    departmentSalaryOverview: vi.fn(),
    countryDistribution: vi.fn()
  }
}));

describe("employeeService.countryInsights", () => {
  it("computes summary metrics", async () => {
    vi.mocked(employeeRepository.salaryRowsByCountry).mockResolvedValue([
      { salary: 100 },
      { salary: 300 },
      { salary: 200 },
      { salary: 400 }
    ] as never);

    const result = await employeeService.countryInsights("India");

    expect(result).toEqual({
      country: "India",
      employeeCount: 4,
      minSalary: 100,
      maxSalary: 400,
      avgSalary: 250,
      medianSalary: 250
    });
  });

  it("returns zeroed metrics for a country with no employees", async () => {
    vi.mocked(employeeRepository.salaryRowsByCountry).mockResolvedValue([] as never);

    const result = await employeeService.countryInsights("Brazil");

    expect(result).toEqual({
      country: "Brazil",
      employeeCount: 0,
      minSalary: 0,
      maxSalary: 0,
      avgSalary: 0,
      medianSalary: 0
    });
  });
});
