import { Request, Response } from "express";
import {
  countryInsightQuerySchema,
  employeeInputSchema,
  employeeListQuerySchema,
  roleInsightQuerySchema
} from "./employee.schemas";
import { employeeService } from "./employee.service";

const badRequest = (res: Response, error: unknown) => res.status(400).json({ error });

export const employeeController = {
  async create(req: Request, res: Response) {
    const parsed = employeeInputSchema.safeParse(req.body);

    if (!parsed.success) {
      return badRequest(res, parsed.error.flatten());
    }

    const employee = await employeeService.create(parsed.data);
    return res.status(201).json(employee);
  },
  async list(req: Request, res: Response) {
    const parsed = employeeListQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return badRequest(res, parsed.error.flatten());
    }

    const result = await employeeService.list(parsed.data);
    return res.json({
      items: result.items,
      total: result.total,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize
    });
  },
  async update(req: Request, res: Response) {
    const parsed = employeeInputSchema.safeParse(req.body);

    if (!parsed.success) {
      return badRequest(res, parsed.error.flatten());
    }

    const employee = await employeeService.update(String(req.params.id), parsed.data);
    return res.json(employee);
  },
  async remove(req: Request, res: Response) {
    await employeeService.remove(String(req.params.id));
    return res.status(204).send();
  },
  async countryInsights(req: Request, res: Response) {
    const parsed = countryInsightQuerySchema.safeParse(req.params);

    if (!parsed.success) {
      return badRequest(res, parsed.error.flatten());
    }

    const insight = await employeeService.countryInsights(parsed.data.country);
    return res.json(insight);
  },
  async roleInsights(req: Request, res: Response) {
    const parsed = roleInsightQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return badRequest(res, parsed.error.flatten());
    }

    const insight = await employeeService.roleInsights(parsed.data.country, parsed.data.jobTitle);
    return res.json(insight);
  },
  async departmentInsights(_req: Request, res: Response) {
    const insight = await employeeService.departmentInsights();
    return res.json(insight);
  },
  async countryDistribution(_req: Request, res: Response) {
    const insight = await employeeService.countryDistribution();
    return res.json(insight);
  }
};
