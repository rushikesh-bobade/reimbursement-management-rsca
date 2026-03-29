export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/company — Fetch current company details
export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get("x-company-id");
    
    if (!companyId) {
       // Fallback for first-time onboarding / seed if needed
       const first = await prisma.company.findFirst();
       return NextResponse.json({ company: first });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    return NextResponse.json({ company });
  } catch (error) {
    console.error("GET /api/company error:", error);
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
}

// PATCH /api/company — Update base settings
export async function PATCH(request: NextRequest) {
  try {
    const companyId = request.headers.get("x-company-id");
    const role = request.headers.get("x-user-role");

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can update company settings" }, { status: 403 });
    }

    const body = await request.json();
    const { name, baseCurrency } = body;

    const company = await prisma.company.update({
      where: { id: companyId as string },
      data: { name, baseCurrency },
    });

    return NextResponse.json({ company });
  } catch (error) {
    console.error("PATCH /api/company error:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}
