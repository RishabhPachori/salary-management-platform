import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const countries = [
  { name: "India", currency: "INR" },
  { name: "United States", currency: "USD" },
  { name: "Germany", currency: "EUR" },
  { name: "United Kingdom", currency: "GBP" },
  { name: "Canada", currency: "CAD" }
] as const;

const departments = ["Engineering", "Product", "HR", "Finance", "Operations", "Sales"] as const;
const jobTitles = [
  "Software Engineer",
  "Senior Software Engineer",
  "Engineering Manager",
  "Product Manager",
  "HR Manager",
  "Finance Analyst",
  "Operations Lead",
  "Sales Manager"
] as const;

const firstNames = ["Rishabh", "Emma", "Noah", "Sophia", "Liam", "Olivia", "Mia", "Ishaan", "Ava", "Lucas"] as const;
const lastNames = ["Pachauri", "Smith", "Brown", "Taylor", "Miller", "Davis", "Wilson", "Mehta", "Gupta", "Clark"] as const;

const pick = <T>(items: readonly T[], index: number) => items[index % items.length];

const salaryBaseByTitle: Record<(typeof jobTitles)[number], number> = {
  "Software Engineer": 65000,
  "Senior Software Engineer": 95000,
  "Engineering Manager": 125000,
  "Product Manager": 105000,
  "HR Manager": 70000,
  "Finance Analyst": 68000,
  "Operations Lead": 80000,
  "Sales Manager": 90000
};

const countryMultiplier: Record<(typeof countries)[number]["name"], number> = {
  India: 0.42,
  "United States": 1.25,
  Germany: 1.05,
  "United Kingdom": 1.1,
  Canada: 1
};

const buildEmployees = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const country = pick(countries, index);
    const department = pick(departments, index * 3);
    const jobTitle = pick(jobTitles, index * 5);
    const firstName = pick(firstNames, index * 7);
    const lastName = pick(lastNames, index * 11);
    const fullName = `${firstName} ${lastName}`;
    const salary =
      salaryBaseByTitle[jobTitle] * countryMultiplier[country.name] + (index % 17) * 1250 + (index % 5) * 340;

    return {
      employeeCode: `EMP-${String(index + 1).padStart(5, "0")}`,
      fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@acme.test`,
      country: country.name,
      department,
      jobTitle,
      salary: Number(salary.toFixed(2)),
      currency: country.currency,
      dateOfJoining: new Date(Date.UTC(2018 + (index % 7), index % 12, (index % 27) + 1))
    };
  });

const run = async () => {
  const employees = buildEmployees(10000);

  await prisma.employee.deleteMany();

  for (let index = 0; index < employees.length; index += 1000) {
    await prisma.employee.createMany({
      data: employees.slice(index, index + 1000)
    });
  }

  console.log(`Seeded ${employees.length} employees`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
