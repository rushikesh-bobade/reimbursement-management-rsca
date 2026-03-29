// Seed script — auto-seeds default Company, Admin, Manager, Employee, and Approval Rules
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create default company
  const company = await prisma.company.upsert({
    where: { id: "default-company" },
    update: {},
    create: {
      id: "default-company",
      name: "Acme Corp",
      baseCurrency: "USD",
    },
  });
  console.log(`✅ Company: ${company.name}`);

  // 2. Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@acme.com" },
    update: {},
    create: {
      email: "admin@acme.com",
      name: "Carol Williams",
      role: "ADMIN",
      department: "Finance",
      companyId: company.id,
    },
  });
  console.log(`✅ Admin: ${admin.name} (${admin.email})`);

  // 3. Create Manager user
  const manager = await prisma.user.upsert({
    where: { email: "manager@acme.com" },
    update: {},
    create: {
      email: "manager@acme.com",
      name: "Bob Martinez",
      role: "MANAGER",
      department: "Engineering",
      companyId: company.id,
    },
  });
  console.log(`✅ Manager: ${manager.name} (${manager.email})`);

  // 4. Create Employee user (reports to Manager)
  const employee = await prisma.user.upsert({
    where: { email: "employee@acme.com" },
    update: {},
    create: {
      email: "employee@acme.com",
      name: "Alice Johnson",
      role: "EMPLOYEE",
      department: "Engineering",
      companyId: company.id,
      managerId: manager.id,
    },
  });
  console.log(`✅ Employee: ${employee.name} (${employee.email})`);

  // 5. Create default approval rules
  const rule1 = await prisma.approvalRule.upsert({
    where: { companyId_stepOrder: { companyId: company.id, stepOrder: 1 } },
    update: {},
    create: {
      companyId: company.id,
      stepOrder: 1,
      ruleName: "Manager Review",
      ruleType: "PERCENTAGE",
      approverRole: "MANAGER",
      percentageRequired: 0.60,
    },
  });
  console.log(`✅ Rule 1: ${rule1.ruleName} (${rule1.ruleType}, ${(rule1.percentageRequired || 0) * 100}%)`);

  const rule2 = await prisma.approvalRule.upsert({
    where: { companyId_stepOrder: { companyId: company.id, stepOrder: 2 } },
    update: {},
    create: {
      companyId: company.id,
      stepOrder: 2,
      ruleName: "Finance Approval",
      ruleType: "HYBRID",
      approverRole: "ADMIN",
      specificRoleName: "Finance",
      percentageRequired: 0.60,
    },
  });
  console.log(`✅ Rule 2: ${rule2.ruleName} (${rule2.ruleType}, ${(rule2.percentageRequired || 0) * 100}% OR ${rule2.specificRoleName})`);

  // 6. Create sample expenses
  await prisma.expense.upsert({
    where: { id: "sample-expense-1" },
    update: {},
    create: {
      id: "sample-expense-1",
      amount: 245.50,
      originalCurrency: "USD",
      category: "TRAVEL",
      description: "Flight to NYC for client meeting",
      date: new Date("2026-03-25"),
      status: "PENDING",
      currentStepOrder: 1,
      submitterId: employee.id,
    },
  });

  await prisma.expense.upsert({
    where: { id: "sample-expense-2" },
    update: {},
    create: {
      id: "sample-expense-2",
      amount: 89.99,
      originalCurrency: "EUR",
      category: "MEALS",
      description: "Team dinner with stakeholders",
      date: new Date("2026-03-26"),
      status: "PENDING",
      currentStepOrder: 1,
      submitterId: employee.id,
    },
  });

  await prisma.expense.upsert({
    where: { id: "sample-expense-3" },
    update: {},
    create: {
      id: "sample-expense-3",
      amount: 15000,
      originalCurrency: "INR",
      category: "SOFTWARE",
      description: "Annual Figma Pro team subscription",
      date: new Date("2026-03-28"),
      status: "PENDING",
      currentStepOrder: 1,
      submitterId: employee.id,
    },
  });

  console.log("✅ Sample expenses created");
  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
