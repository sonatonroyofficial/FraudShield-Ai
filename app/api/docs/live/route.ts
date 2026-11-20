import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, verifyToken } from "@/lib/adminAuth";
import { accessState, loadRecord } from "@/lib/server/docsStore";
import { liveSnapshot } from "@/lib/server/live";

export const runtime = "nodejs";

export async function GET() {
  const rec = await loadRecord();
  const admin = await verifyToken((await cookies()).get(COOKIE)?.value);
  if (!accessState(rec.access).open && !admin) return NextResponse.json({ error: "Not available" }, { status: 403 });
  return NextResponse.json(await liveSnapshot(), { headers: { "Cache-Control": "no-store" } });
}
