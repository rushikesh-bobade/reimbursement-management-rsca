export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/schemas";
import { signToken, setAuthCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const { name, email, password, companyName, baseCurrency } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Company and Admin user in transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await prisma.$transaction(async (tx: any) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          baseCurrency,
        },
      });

      return await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "ADMIN",
          companyId: company.id,
        },
      });
    });

    // Sign JWT and set cookie
    const token = await signToken({
      id: user.id,
      role: user.role,
      companyId: user.companyId,
    });
    
    await setAuthCookie(token);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "Signup successful", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
