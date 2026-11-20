import { NextResponse } from "next/server";
import { listReports, submitReport, serializeReport } from "@/lib/server/repo";

export const runtime = "nodejs";

/** Public: approved, moderated community alerts only. */
export async function GET() {
  try {
    const items = (await listReports("approved")).map(({ content: _c, ...r }) => r);
    return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ items: [], unavailable: true }, { status: 200 });
  }
}

const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000); list.push(now); hits.set(ip, list);
  if (list.length > 6) return NextResponse.json({ error: "Too many reports. Please wait a minute." }, { status: 429 });

  const b = await req.json().catch(() => null);
  const type = b?.type, content = typeof b?.content === "string" ? b.content.trim() : "";
  if (!["message", "url", "phone"].includes(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  if (content.length < 4 || content.length > 1000) return NextResponse.json({ error: "Report must be 4–1000 characters." }, { status: 400 });
  try {
    const doc = await submitReport(type, content);
    if (!doc) throw new Error("no doc");
    const { content: _c, ...pub } = serializeReport(doc);
    return NextResponse.json({ ok: true, report: pub });
  } catch {
    return NextResponse.json({ error: "Could not save the report right now." }, { status: 503 });
  }
}
