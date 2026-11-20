import { NextResponse } from "next/server";
import { analyzeMessage } from "@/lib/server/engine";
import { logScan } from "@/lib/server/repo";

export const runtime = "nodejs";
export const maxDuration = 45;

const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000); list.push(now); hits.set(ip, list);
  if (list.length > 15) return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });

  const b = await req.json().catch(() => null);
  const url = typeof b?.url === "string" ? b.url.trim() : "";
  if (url.length < 4 || url.length > 2000 || /\s/.test(url)) return NextResponse.json({ error: "Please enter a single web address." }, { status: 400 });
  // The submitted address is only analysed as text — it is never fetched or opened by the server (SSRF-safe).
  const result = await analyzeMessage(url, "url");
  try { await logScan(result); } catch (e) { console.error("[db] scan log failed", (e as Error).message); }
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
