import { z } from "zod";

export const employeeInputSchema = z.object({
  employeeCode: z.string().trim().min(3).max(20),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  country: z.string().trim().min(2).max(80),
  department: z.string().trim().min(2).max(80),
  jobTitle: z.string().trim().min(2).max(120),
  salary: z.coerce.number().positive().max(100000000),
  currency: z.string().trim().length(3),
  dateOfJoining: z.string().datetime()
});

export const employeeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().default(""),
  country: z.string().trim().optional(),
  department: z.string().trim().optional()
});

export const countryInsightQuerySchema = z.object({
  country: z.string().trim().min(2)
});

export const roleInsightQuerySchema = z.object({
  country: z.string().trim().min(2),
  jobTitle: z.string().trim().min(2)
});

export type EmployeeInput = z.infer<typeof employeeInputSchema>;
export type EmployeeListQuery = z.infer<typeof employeeListQuerySchema>;
