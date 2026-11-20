import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, verifyToken } from "@/lib/adminAuth";
import { accessState, loadRecord, publicContent } from "@/lib/server/docsStore";

export const runtime = "nodejs";

/** Public JSON view of the published docs. 403 while the access switch / schedule says closed. */
export async function GET() {
  const rec = await loadRecord();
  const st = accessState(rec.access);
  const admin = await verifyToken((await cookies()).get(COOKIE)?.value);
  if (!st.open && !admin) return NextResponse.json({ error: "Not available", reason: st.reason }, { status: 403 });
  return NextResponse.json({ preview: !st.open, content: publicContent(rec), published_at: rec.published_at }, { headers: { "Cache-Control": "no-store" } });
}
