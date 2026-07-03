import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { EmployeeInput, EmployeeListQuery } from "./employee.schemas";

const buildWhere = (query: EmployeeListQuery): Prisma.EmployeeWhereInput => {
  const search = query.search.trim();

  return {
    ...(search
      ? {
          OR: [
            { employeeCode: { contains: search, mode: "insensitive" } },
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { country: { contains: search, mode: "insensitive" } },
            { department: { contains: search, mode: "insensitive" } },
            { jobTitle: { contains: search, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(query.country ? { country: query.country } : {}),
    ...(query.department ? { department: query.department } : {})
  };
};

export const employeeRepository = {
  create: (data: EmployeeInput) =>
    prisma.employee.create({
      data: {
        ...data,
        dateOfJoining: new Date(data.dateOfJoining),
        salary: data.salary
      }
    }),
  list: async (query: EmployeeListQuery) => {
    const where = buildWhere(query);
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: query.pageSize
      }),
      prisma.employee.count({ where })
    ]);

    return { items, total };
  },
  getById: (id: string) => prisma.employee.findUnique({ where: { id } }),
  update: (id: string, data: EmployeeInput) =>
    prisma.employee.update({
      where: { id },
      data: {
        ...data,
        dateOfJoining: new Date(data.dateOfJoining),
        salary: data.salary
      }
    }),
  remove: (id: string) => prisma.employee.delete({ where: { id } }),
  salaryRowsByCountry: (country: string) =>
    prisma.employee.findMany({
      where: { country },
      select: {
        salary: true
      }
    }),
  averageSalaryByRole: async (country: string, jobTitle: string) => {
    const aggregate = await prisma.employee.aggregate({
      where: { country, jobTitle },
      _avg: { salary: true },
      _count: { _all: true }
    });

    return aggregate;
  },
  departmentSalaryOverview: () =>
    prisma.employee.groupBy({
      by: ["department"],
      _count: { _all: true },
      _avg: { salary: true },
      _min: { salary: true },
      _max: { salary: true },
      orderBy: {
        department: "asc"
      }
    }),
  countryDistribution: () =>
    prisma.employee.groupBy({
      by: ["country"],
      _count: { _all: true },
      _avg: { salary: true },
      orderBy: {
        _count: {
          country: "desc"
        }
      }
    })
};
