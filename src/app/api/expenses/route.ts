export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { expenseFormSchema } from "@/lib/schemas";
import { convertCurrency } from "@/lib/currency";
import { initializeApprovalQueue } from "@/lib/approval-engine";

// GET /api/expenses — fetch expenses (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submitterId = searchParams.get("submitterId");
    const status = searchParams.get("status");
    const baseCurrency = searchParams.get("baseCurrency") || "USD";

    const where: Record<string, unknown> = {};
    if (submitterId) where.submitterId = submitterId;
    if (status) where.status = status;

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        submitter: { select: { id: true, name: true, email: true, department: true, role: true } },
        approvalQueue: {
          include: {
            approvalRule: true,
            approver: { select: { id: true, name: true, role: true, department: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Dynamic currency conversion for each expense
    const expensesWithConversion = await Promise.all(
      expenses.map(async (exp: any) => {
        let convertedAmount = exp.amount;
        try {
          if (exp.originalCurrency !== baseCurrency) {
            convertedAmount = await convertCurrency(exp.amount, exp.originalCurrency, baseCurrency);
          }
        } catch {
          // Keep original amount if conversion fails
        }
        return { ...exp, convertedAmount, baseCurrency };
      })
    );

    return NextResponse.json({ expenses: expensesWithConversion });
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

// POST /api/expenses — submit new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = expenseFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount, originalCurrency, category, description, date, receiptUrl } = parsed.data;
    const submitterId = request.headers.get("x-user-id");

    if (!submitterId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: submitterId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        originalCurrency,
        category,
        description,
        date: new Date(date),
        receiptUrl,
        submitterId,
        status: "PENDING",
        currentStepOrder: 1,
      },
    });

    // Initialize the approval queue
    await initializeApprovalQueue(expense.id, user.companyId);

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
