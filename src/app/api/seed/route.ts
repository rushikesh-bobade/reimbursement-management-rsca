export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/seed — auto-seed the database on first load
export async function GET() {
  try {
    // Check if already seeded
    const existingCompany = await prisma.company.findFirst();
    if (existingCompany) {
      return NextResponse.json({ message: "Already seeded", seeded: false });
    }

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Seed company
    const company = await prisma.company.create({
      data: { id: "default-company", name: "Acme Corp", baseCurrency: "USD" },
    });

    // Seed users
    const admin = await prisma.user.create({
      data: {
        email: "admin@acme.com",
        name: "Carol Williams",
        password: hashedPassword,
        role: "ADMIN",
        department: "Finance",
        companyId: company.id,
      },
    });

    const manager = await prisma.user.create({
      data: {
        email: "manager@acme.com",
        name: "Bob Martinez",
        password: hashedPassword,
        role: "MANAGER",
        department: "Engineering",
        companyId: company.id,
      },
    });

    const employee = await prisma.user.create({
      data: {
        email: "employee@acme.com",
        name: "Alice Johnson",
        password: hashedPassword,
        role: "EMPLOYEE",
        department: "Engineering",
        companyId: company.id,
        managerId: manager.id,
      },
    });

    // Seed approval rules
    await prisma.approvalRule.create({
      data: {
        companyId: company.id,
        stepOrder: 1,
        ruleName: "Manager Review",
        ruleType: "PERCENTAGE",
        approverRole: "MANAGER",
        percentageRequired: 0.60,
      },
    });

    await prisma.approvalRule.create({
      data: {
        companyId: company.id,
        stepOrder: 2,
        ruleName: "Finance Approval",
        ruleType: "HYBRID",
        approverRole: "ADMIN",
        specificRoleName: "Finance",
        percentageRequired: 0.60,
      },
    });

    // Seed sample expenses
    await prisma.expense.createMany({
      data: [
        {
          amount: 245.50,
          originalCurrency: "USD",
          category: "TRAVEL",
          description: "Flight to NYC for client meeting",
          date: new Date("2026-03-25"),
          status: "PENDING",
          currentStepOrder: 1,
          submitterId: employee.id,
        },
        {
          amount: 89.99,
          originalCurrency: "EUR",
          category: "MEALS",
          description: "Team dinner with stakeholders",
          date: new Date("2026-03-26"),
          status: "PENDING",
          currentStepOrder: 1,
          submitterId: employee.id,
        },
        {
          amount: 15000,
          originalCurrency: "INR",
          category: "SOFTWARE",
          description: "Annual Figma Pro team subscription",
          date: new Date("2026-03-28"),
          status: "PENDING",
          currentStepOrder: 1,
          submitterId: employee.id,
        },
      ],
    });

    return NextResponse.json({
      message: "Database seeded successfully!",
      seeded: true,
      data: { company: company.name, admin: admin.email, manager: manager.email, employee: employee.email },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
