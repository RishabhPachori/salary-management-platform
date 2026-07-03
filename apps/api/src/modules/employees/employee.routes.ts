import { Router } from "express";
import { employeeController } from "./employee.controller";

export const employeeRouter = Router();

employeeRouter.get("/", employeeController.list);
employeeRouter.post("/", employeeController.create);
employeeRouter.put("/:id", employeeController.update);
employeeRouter.delete("/:id", employeeController.remove);
employeeRouter.get("/insights/country/:country", employeeController.countryInsights);
employeeRouter.get("/insights/role", employeeController.roleInsights);
employeeRouter.get("/insights/departments", employeeController.departmentInsights);
employeeRouter.get("/insights/countries", employeeController.countryDistribution);
