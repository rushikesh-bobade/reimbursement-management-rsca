export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas";
import { signToken, setAuthCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

type BootstrapResponsePayload = {
  success: boolean;
  code: string;
  setupRequired: boolean;
  nextStep: "CREATE_COMPANY" | "CREATE_ADMIN_USER" | "LOGIN_COMPLETE";
  message?: string;
  error?: string;
  requiredFields?: string[];
  data?: {
    company?: {
      id: string;
      name: string;
      baseCurrency: string;
    };
    user?: Record<string, unknown>;
  };
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const { email, password } = result.data;
    const bootstrapName = typeof body.name === "string" ? body.name.trim() : "";
    const bootstrapCompanyName =
      typeof body.companyName === "string" ? body.companyName.trim() : "";
    const bootstrapBaseCurrency =
      typeof body.baseCurrency === "string" ? body.baseCurrency.trim().toUpperCase() : "";

    const [companyCount, userCount] = await Promise.all([
      prisma.company.count(),
      prisma.user.count(),
    ]);

    // Part 1: First-login bootstrap guard
    // If system is not initialized, login cannot proceed as normal credential auth.
    if (companyCount === 0 && userCount === 0) {
      // Part 2: Create company on first login if setup payload includes company details.
      if (bootstrapCompanyName.length >= 2 && bootstrapBaseCurrency.length === 3) {
        const existingCompany = await prisma.company.findFirst();

        const company = existingCompany
          ? existingCompany
          : await prisma.company.create({
              data: {
                name: bootstrapCompanyName,
                baseCurrency: bootstrapBaseCurrency,
              },
            });

        const payload: BootstrapResponsePayload = {
          success: true,
          code: "FIRST_LOGIN_COMPANY_CREATED",
          setupRequired: true,
          nextStep: "CREATE_ADMIN_USER",
          message: "Company created. Continue first-login setup by creating admin user.",
          data: {
            company: {
              id: company.id,
              name: company.name,
              baseCurrency: company.baseCurrency,
            },
          },
        };

        return NextResponse.json(payload, { status: 201 });
      }

      const payload: BootstrapResponsePayload = {
        success: false,
        code: "FIRST_LOGIN_SETUP_REQUIRED",
        setupRequired: true,
        nextStep: "CREATE_COMPANY",
        error: "System is not initialized. First login requires bootstrap setup.",
        requiredFields: ["name", "companyName", "baseCurrency", "email", "password"],
      };

      return NextResponse.json(payload, { status: 428 });
    }

    // Part 3: If company exists but there are no users, create the first admin user.
    if (companyCount > 0 && userCount === 0) {
      const company = await prisma.company.findFirst();

      if (!company) {
        const payload: BootstrapResponsePayload = {
          success: false,
          code: "FIRST_LOGIN_COMPANY_MISSING",
          setupRequired: true,
          nextStep: "CREATE_COMPANY",
          error: "System bootstrap is inconsistent. Company setup is missing.",
        };

        return NextResponse.json(payload, { status: 500 });
      }

      if (bootstrapName.length < 2) {
        const payload: BootstrapResponsePayload = {
          success: false,
          code: "FIRST_LOGIN_ADMIN_REQUIRED",
          setupRequired: true,
          nextStep: "CREATE_ADMIN_USER",
          error: "First admin setup requires name, email, and password.",
          requiredFields: ["name", "email", "password"],
        };

        return NextResponse.json(payload, { status: 428 });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        const payload: BootstrapResponsePayload = {
          success: false,
          code: "FIRST_LOGIN_ADMIN_EMAIL_EXISTS",
          setupRequired: true,
          nextStep: "CREATE_ADMIN_USER",
          error: "User already exists with this email",
        };

        return NextResponse.json(payload, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const adminUser = await prisma.user.create({
        data: {
          name: bootstrapName,
          email,
          password: hashedPassword,
          role: "ADMIN",
          companyId: company.id,
        },
      });

      const token = await signToken({
        id: adminUser.id,
        role: adminUser.role,
        companyId: adminUser.companyId,
      });

      await setAuthCookie(token);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pw, ...userWithoutPassword } = adminUser;

      const payload: BootstrapResponsePayload = {
        success: true,
        code: "FIRST_LOGIN_ADMIN_CREATED",
        setupRequired: false,
        nextStep: "LOGIN_COMPLETE",
        message: "First admin user created successfully",
        data: {
          user: userWithoutPassword,
          company: {
            id: company.id,
            name: company.name,
            baseCurrency: company.baseCurrency,
          },
        },
      };

      return NextResponse.json(payload, { status: 201 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Sign JWT and set cookie
    const token = await signToken({
      id: user.id,
      role: user.role,
      companyId: user.companyId,
    });
    
    await setAuthCookie(token);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
