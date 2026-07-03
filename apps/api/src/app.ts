import express from "express";
import cors from "cors";
import helmet from "helmet";
import { employeeRouter } from "./modules/employees/employee.routes";

export const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/employees", employeeRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  const statusCode = message === "Employee not found" ? 404 : 500;

  res.status(statusCode).json({ error: message });
});
