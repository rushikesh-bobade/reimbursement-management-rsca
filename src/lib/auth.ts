import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || "super_secret_fallback_key_for_hackathon";
  return new TextEncoder().encode(secret);
};

export type AuthJwtPayload = {
  id: string;
  role: Role;
  companyId: string;
};

export async function signToken(payload: AuthJwtPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getJwtSecretKey());
}

export async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(token, getJwtSecretKey());
    return verified.payload as AuthJwtPayload;
  } catch (_err) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return await verifyAuth(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}
