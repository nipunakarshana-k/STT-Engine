import jwt from "jsonwebtoken";
import { cookies } from "next-headers"; // Wait, in Next.js 15, cookies can be imported from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "stt-engine-default-secret-key-change-in-production";

export function signToken(payload: { userId: string; email: string; name?: string | null }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; name?: string | null };
  } catch (error) {
    return null;
  }
}

// In Next.js 15, cookies is an async function in Server Components and Route Handlers, but in route handlers we can also read it from req headers or cookies()
export async function getSessionUser() {
  try {
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}
