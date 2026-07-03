import { describe, expect, it, vi } from "vitest";
import { employeeController } from "./employee.controller";
import { employeeService } from "./employee.service";

vi.mock("./employee.service", () => ({
  employeeService: {
    create: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    countryInsights: vi.fn(),
    roleInsights: vi.fn(),
    departmentInsights: vi.fn(),
    countryDistribution: vi.fn()
  }
}));

const createResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
    send: vi.fn()
  };

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  response.send.mockReturnValue(response);

  return response;
};

const validEmployeePayload = {
  employeeCode: "EMP-00001",
  fullName: "Rishabh Pachauri",
  email: "rishabh@acme.test",
  country: "India",
  department: "Engineering",
  jobTitle: "Engineering Manager",
  salary: 68750,
  currency: "INR",
  dateOfJoining: "2024-01-15T00:00:00.000Z"
};

describe("employeeController.create", () => {
  it("returns 400 for invalid payload", async () => {
    const req = {
      body: {
        fullName: "A"
      }
    };
    const res = createResponse();

    await employeeController.create(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(vi.mocked(employeeService.create)).not.toHaveBeenCalled();
  });

  it("returns 201 for valid payload", async () => {
    const req = {
      body: validEmployeePayload
    };
    const res = createResponse();
    const createdEmployee = {
      id: "employee-1",
      ...validEmployeePayload
    };

    vi.mocked(employeeService.create).mockResolvedValue(createdEmployee as never);

    await employeeController.create(req as never, res as never);

    expect(employeeService.create).toHaveBeenCalledWith(validEmployeePayload);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdEmployee);
  });
});

describe("employeeController.roleInsights", () => {
  it("returns 400 when required query params are missing", async () => {
    const req = {
      query: {
        country: "India"
      }
    };
    const res = createResponse();

    await employeeController.roleInsights(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(vi.mocked(employeeService.roleInsights)).not.toHaveBeenCalled();
  });
});
