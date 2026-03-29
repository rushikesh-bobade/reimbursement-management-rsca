import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "super_secret_fallback_key_for_hackathon";
  return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Unprotected routes
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/seed") ||
    pathname.startsWith("/api/ocr") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Redirect to login if accessing protected UI
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    
    // Pass user info via headers for API routes if needed
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", verified.payload.id as string);
    requestHeaders.set("x-user-role", verified.payload.role as string);
    requestHeaders.set("x-company-id", verified.payload.companyId as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err) {
    // Token is invalid/expired
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
      
    // Remove the invalid cookie
    response.cookies.delete("auth_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
