import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, verifyToken } from "@/lib/adminAuth";
import { stats } from "@/lib/server/repo";

export const runtime = "nodejs";

export async function GET() {
  if (!(await verifyToken((await cookies()).get(COOKIE)?.value))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(await stats(), { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Database unavailable" }, { status: 503 }); }
}
