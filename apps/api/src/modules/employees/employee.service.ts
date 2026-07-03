import { employeeRepository } from "./employee.repository";
import { EmployeeInput, EmployeeListQuery } from "./employee.schemas";

const toNumber = (value: unknown) => Number(value ?? 0);

const calculateMedian = (values: number[]) => {
  if (!values.length) {
    return 0;
  }

  const middleIndex = Math.floor(values.length / 2);

  return values.length % 2 === 0
    ? Number(((values[middleIndex - 1] + values[middleIndex]) / 2).toFixed(2))
    : Number(values[middleIndex].toFixed(2));
};

export const employeeService = {
  create: (data: EmployeeInput) => employeeRepository.create(data),
  list: (query: EmployeeListQuery) => employeeRepository.list(query),
  async update(id: string, data: EmployeeInput) {
    const existing = await employeeRepository.getById(id);

    if (!existing) {
      throw new Error("Employee not found");
    }

    return employeeRepository.update(id, data);
  },
  async remove(id: string) {
    const existing = await employeeRepository.getById(id);

    if (!existing) {
      throw new Error("Employee not found");
    }

    await employeeRepository.remove(id);
  },
  async countryInsights(country: string) {
    const rows = await employeeRepository.salaryRowsByCountry(country);
    const salaries = rows.map((row) => toNumber(row.salary)).sort((a, b) => a - b);

    if (!salaries.length) {
      return {
        country,
        employeeCount: 0,
        minSalary: 0,
        maxSalary: 0,
        avgSalary: 0,
        medianSalary: 0
      };
    }

    const total = salaries.reduce((sum, salary) => sum + salary, 0);

    return {
      country,
      employeeCount: salaries.length,
      minSalary: salaries[0],
      maxSalary: salaries[salaries.length - 1],
      avgSalary: Number((total / salaries.length).toFixed(2)),
      medianSalary: calculateMedian(salaries)
    };
  },
  async roleInsights(country: string, jobTitle: string) {
    const aggregate = await employeeRepository.averageSalaryByRole(country, jobTitle);

    return {
      country,
      jobTitle,
      employeeCount: aggregate._count._all,
      avgSalary: Number((toNumber(aggregate._avg.salary) || 0).toFixed(2))
    };
  },
  async departmentInsights() {
    const rows = await employeeRepository.departmentSalaryOverview();

    return rows.map((row) => ({
      department: row.department,
      employeeCount: row._count._all,
      avgSalary: Number(toNumber(row._avg.salary).toFixed(2)),
      minSalary: Number(toNumber(row._min.salary).toFixed(2)),
      maxSalary: Number(toNumber(row._max.salary).toFixed(2))
    }));
  },
  async countryDistribution() {
    const rows = await employeeRepository.countryDistribution();

    return rows.map((row) => ({
      country: row.country,
      employeeCount: row._count._all,
      avgSalary: Number(toNumber(row._avg.salary).toFixed(2))
    }));
  }
};
