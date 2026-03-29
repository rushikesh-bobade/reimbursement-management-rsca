export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { approvalRuleSchema } from "@/lib/schemas";

// GET /api/approval-rules
export async function GET() {
  try {
    const rules = await prisma.approvalRule.findMany({
      orderBy: { stepOrder: "asc" },
      include: { company: { select: { name: true, baseCurrency: true } } },
    });
    return NextResponse.json({ rules });
  } catch (error) {
    console.error("GET /api/approval-rules error:", error);
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
  }
}

// POST /api/approval-rules — create a new rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = approvalRuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "No company found" }, { status: 500 });
    }

    const rule = await prisma.approvalRule.create({
      data: {
        ...parsed.data,
        companyId: company.id,
      },
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error("POST /api/approval-rules error:", error);
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
  }
}

// DELETE /api/approval-rules
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Rule ID required" }, { status: 400 });
    }

    await prisma.approvalRule.delete({ where: { id } });

    // Re-order remaining rules
    const company = await prisma.company.findFirst();
    if (company) {
      const remaining = await prisma.approvalRule.findMany({
        where: { companyId: company.id },
        orderBy: { stepOrder: "asc" },
      });
      for (let i = 0; i < remaining.length; i++) {
        await prisma.approvalRule.update({
          where: { id: remaining[i].id },
          data: { stepOrder: i + 1 },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/approval-rules error:", error);
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
  }
}
