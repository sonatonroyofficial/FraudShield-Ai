import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, verifyToken } from "@/lib/adminAuth";
import { accessState, loadRecord, saveRecord, validateAccess, validateContent } from "@/lib/server/docsStore";

export const runtime = "nodejs";
const deny = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const authed = async () => verifyToken((await cookies()).get(COOKIE)?.value);
const bad = (m: string) => NextResponse.json({ error: m }, { status: 400 });

export async function GET() {
  if (!(await authed())) return deny();
  const rec = await loadRecord();
  return NextResponse.json({ ...rec, state: accessState(rec.access) }, { headers: { "Cache-Control": "no-store" } });
}

/** One endpoint, explicit actions: access | save | publish | restore */
export async function POST(req: Request) {
  if (!(await authed())) return deny();
  const b = await req.json().catch(() => null);
  if (!b || typeof b.action !== "string") return bad("Bad request");
  const rec = await loadRecord();

  if (b.action === "access") {
    const a = validateAccess(b.access); if (!a) return bad("Invalid access settings (end must be after start).");
    rec.access = a;
  } else if (b.action === "save" || b.action === "publish") {
    const c = validateContent(b.draft); if (!c) return bad("Invalid content.");
    rec.draft = c;
    if (b.action === "publish") {
      rec.published = structuredClone(c);
      rec.published_at = new Date().toISOString();
      rec.versions = [{ id: "v" + Date.now(), at: rec.published_at, label: typeof b.label === "string" && b.label.trim() ? b.label.trim().slice(0, 80) : "Published", content: structuredClone(c) }, ...rec.versions].slice(0, 20);
    }
  } else if (b.action === "restore") {
    const v = rec.versions.find((x) => x.id === b.id); if (!v) return bad("Version not found");
    rec.draft = structuredClone(v.content);
  } else return bad("Unknown action");

  const saved = await saveRecord(rec);
  return NextResponse.json({ ...saved, state: accessState(saved.access) });
}
