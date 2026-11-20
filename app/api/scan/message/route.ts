import { NextResponse } from "next/server";
import { analyzeMessage } from "@/lib/server/engine";
import { logScan } from "@/lib/server/repo";

export const runtime = "nodejs";
export const maxDuration = 45;

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 15;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (text.length < 4) return NextResponse.json({ error: "Message is too short." }, { status: 400 });
  if (text.length > 5000) return NextResponse.json({ error: "Message is too long (max 5000 characters)." }, { status: 413 });
  const result = await analyzeMessage(text);
  try { await logScan(result); } catch (e) { console.error("[db] scan log failed", (e as Error).message); }
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
