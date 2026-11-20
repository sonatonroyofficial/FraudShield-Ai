import { NextResponse } from "next/server";
import { COOKIE, makeToken } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  const okEmail = process.env.ADMIN_EMAIL, okPass = process.env.ADMIN_PASSWORD;
  if (!okEmail || !okPass || typeof email !== "string" || typeof password !== "string" || email.trim().toLowerCase() !== okEmail.toLowerCase() || password !== okPass) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await makeToken(okEmail), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return res;
}
