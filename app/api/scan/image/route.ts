import { NextResponse } from "next/server";
import { analyzeMessage } from "@/lib/server/engine";
import { readTextFromImage } from "@/lib/server/vision";
import { logScan } from "@/lib/server/repo";

export const runtime = "nodejs";
export const maxDuration = 60;

const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000); list.push(now); hits.set(ip, list);
  if (list.length > 8) return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });

  const b = await req.json().catch(() => null);
  const img = typeof b?.image === "string" ? b.image : "";
  if (!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(img)) return NextResponse.json({ error: "Please upload a PNG, JPG or WebP image." }, { status: 400 });
  if (img.length > 8 * 1024 * 1024) return NextResponse.json({ error: "Image is too large." }, { status: 413 });

  const text = await readTextFromImage(img);
  if (text === null) return NextResponse.json({ error: "Could not read the screenshot right now. Please try again." }, { status: 502 });
  if (text.length < 4) return NextResponse.json({ error: "No readable text was found in this screenshot." }, { status: 422 });

  const result = await analyzeMessage(text, "image");
  try { await logScan(result); } catch (e) { console.error("[db] scan log failed", (e as Error).message); }
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
