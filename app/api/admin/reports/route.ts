import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, verifyToken } from "@/lib/adminAuth";
import { listReports, setReportStatus, type ReportStatus } from "@/lib/server/repo";

export const runtime = "nodejs";
const deny = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const authed = async () => verifyToken((await cookies()).get(COOKIE)?.value);

export async function GET() {
  if (!(await authed())) return deny();
  try { return NextResponse.json({ items: await listReports() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ items: [], unavailable: true }); }
}

export async function PATCH(req: Request) {
  if (!(await authed())) return deny();
  const b = await req.json().catch(() => null);
  if (typeof b?.id !== "string" || !["pending", "approved", "rejected", "more-info"].includes(b?.status)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  try { return (await setReportStatus(b.id, b.status as ReportStatus)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
  catch { return NextResponse.json({ error: "Database unavailable" }, { status: 503 }); }
}
