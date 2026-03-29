export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createUserSchema } from "@/lib/schemas";

// GET /api/users — list all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        manager: { select: { id: true, name: true } },
        company: { select: { id: true, name: true, baseCurrency: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/users — create a new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, role, department, managerId } = parsed.data;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // Get default company
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "No company found. Please seed the database." }, { status: 500 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        department,
        managerId: managerId || undefined,
        companyId: company.id,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
