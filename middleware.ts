import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifyToken } from "@/lib/adminAuth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ok = await verifyToken(req.cookies.get(COOKIE)?.value);
  if (pathname === "/admin/login") {
    if (ok) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }
  if (!ok) return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
