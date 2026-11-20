import { promises as fs } from "fs";
import path from "path";
import sanitizeHtml from "sanitize-html";
import { getDb } from "@/lib/mongodb";
import { seedRecord } from "./docsDefaults";
import type { AccessReason, DocSection, DocsAccess, DocsContent, DocsRecord, TeamMember } from "@/lib/docsTypes";

const FILE = path.join(process.cwd(), ".data", "docs.json");

/* ---------- sanitising & validation (server is the only trusted writer) ---------- */
export const cleanHtml = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: ["h2", "h3", "h4", "p", "br", "ul", "ol", "li", "strong", "b", "em", "i", "u", "a", "blockquote", "code", "pre", "table", "thead", "tbody", "tr", "th", "td", "hr", "span"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href"],
    allowProtocolRelative: false,
    transformTags: { a: (tag, attribs) => ({ tagName: "a", attribs: { ...attribs, rel: "noopener noreferrer", ...(attribs.href?.startsWith("http") ? { target: "_blank" } : {}) } }) },
  });

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "section";

export function validateContent(raw: any): DocsContent | null {
  if (!raw || !Array.isArray(raw.sections)) return null;
  const used = new Set<string>();
  const sections: DocSection[] = raw.sections.slice(0, 60).map((s: any) => {
    let id = slug(str(s.id, 40) || str(s.title, 40)); while (used.has(id)) id += "-2"; used.add(id);
    const type = ["rich", "features", "mermaid", "team", "live", "changelog"].includes(s.type) ? s.type : "rich";
    return { id, title: str(s.title, 80) || "Untitled", group: s.group === "tech" ? "tech" : "pitch", type, visible: s.visible !== false,
      html: typeof s.html === "string" ? cleanHtml(s.html.slice(0, 60000)) : undefined,
      mermaid: typeof s.mermaid === "string" ? s.mermaid.slice(0, 5000) : undefined, caption: s.caption ? str(s.caption, 300) : undefined } as DocSection;
  });
  const members: TeamMember[] = (Array.isArray(raw.team?.members) ? raw.team.members : []).slice(0, 24).map((m: any, i: number) => ({
    id: str(m.id, 40) || "m" + i, name: str(m.name, 80), role: str(m.role, 80), email: str(m.email, 120),
    photo: typeof m.photo === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(m.photo) && m.photo.length < 220_000 ? m.photo : undefined,
  }));
  const changelog = (Array.isArray(raw.changelog) ? raw.changelog : []).slice(0, 50).map((c: any) => ({
    version: str(c.version, 20), date: str(c.date, 20), notes: (Array.isArray(c.notes) ? c.notes : []).slice(0, 20).map((n: any) => str(n, 300)).filter(Boolean),
  }));
  return { title: str(raw.title, 80) || "ThreatX AI", tagline: str(raw.tagline, 160), sections, team: { name: str(raw.team?.name, 80), members }, changelog };
}

export function validateAccess(raw: any): DocsAccess | null {
  if (!raw || typeof raw.visible !== "boolean") return null;
  const s = new Date(raw.start), e = new Date(raw.end);
  if (raw.scheduleEnabled && (isNaN(+s) || isNaN(+e) || +e <= +s)) return null;
  return { visible: raw.visible, scheduleEnabled: !!raw.scheduleEnabled, start: isNaN(+s) ? new Date().toISOString() : s.toISOString(), end: isNaN(+e) ? new Date().toISOString() : e.toISOString() };
}

/* ---------- storage: MongoDB first, local file fallback (so docs work even if Atlas is unreachable) ---------- */
async function readFile(): Promise<DocsRecord | null> {
  try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return null; }
}
async function writeFile(rec: DocsRecord) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(rec));
}

export async function loadRecord(): Promise<DocsRecord> {
  const file = await readFile();
  try {
    const col = (await getDb()).collection<any>("docs");
    const doc = await col.findOne({ _id: "main" });
    if (doc) { const { _id, ...rec } = doc; return rec as DocsRecord; }
    const rec = file ?? seedRecord();
    await col.replaceOne({ _id: "main" }, { _id: "main", ...rec }, { upsert: true });
    return rec;
  } catch {
    if (file) return file;
    const rec = seedRecord(); await writeFile(rec).catch(() => {}); return rec;
  }
}

export async function saveRecord(rec: DocsRecord): Promise<DocsRecord> {
  rec.updated_at = new Date().toISOString();
  try {
    await (await getDb()).collection<any>("docs").replaceOne({ _id: "main" }, { _id: "main", ...rec }, { upsert: true });
  } catch {
    await writeFile(rec);
  }
  return rec;
}

/* ---------- access control ---------- */
export function accessState(a: DocsAccess, now = new Date()): { open: boolean; reason: AccessReason } {
  if (!a.visible) return { open: false, reason: "off" };
  if (a.scheduleEnabled) {
    if (+now < +new Date(a.start)) return { open: false, reason: "upcoming" };
    if (+now > +new Date(a.end)) return { open: false, reason: "ended" };
  }
  return { open: true, reason: "open" };
}

export function publicContent(rec: DocsRecord): DocsContent {
  const c = structuredClone(rec.published);
  c.sections = c.sections.filter((s) => s.visible).map((s) => ({ ...s, html: s.html ? cleanHtml(s.html) : undefined }));
  return c;
}
