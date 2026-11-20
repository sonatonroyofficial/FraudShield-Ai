import { createHash } from "crypto";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { ScanResult } from "@/types";

export type ReportStatus = "pending" | "approved" | "rejected" | "more-info";
export interface ReportDoc {
  _id?: ObjectId; type: "message" | "url" | "phone"; content: string; content_hash: string;
  status: ReportStatus; count: number; category: string; created_at: Date; updated_at: Date;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
export const hashContent = (s: string) => createHash("sha256").update(norm(s)).digest("hex");

export async function ensureIndexes() {
  const db = await getDb();
  await Promise.all([
    db.collection("reports").createIndex({ content_hash: 1 }, { unique: true }),
    db.collection("reports").createIndex({ status: 1, updated_at: -1 }),
    db.collection("scans").createIndex({ created_at: -1 }),
    db.collection("scans").createIndex({ risk_level: 1 }),
  ]);
}
let indexed = false;
async function db() { const d = await getDb(); if (!indexed) { indexed = true; ensureIndexes().catch(() => { indexed = false; }); } return d; }

/** Privacy: only metadata is stored for scans — never the raw submitted text. */
export async function logScan(r: ScanResult) {
  const d = await db();
  await d.collection("scans").insertOne({
    scan_id: r.scan_id, input_type: r.input_type, risk_level: r.risk_level, language: r.language,
    scam_type: r.scam_type?.en ?? null, indicator_count: r.indicators.length, engine: r.engine ?? null,
    content_hash: hashContent(r.input_preview), created_at: new Date(),
  });
}

export async function submitReport(type: ReportDoc["type"], content: string) {
  const d = await db();
  const hash = hashContent(content);
  const now = new Date();
  const res = await d.collection<ReportDoc>("reports").findOneAndUpdate(
    { content_hash: hash },
    { $inc: { count: 1 }, $set: { updated_at: now }, $setOnInsert: { type, content: content.slice(0, 1000), content_hash: hash, status: "pending", category: "Awaiting review", created_at: now } },
    { upsert: true, returnDocument: "after" },
  );
  return res;
}

export const serializeReport = (r: ReportDoc) => ({
  id: String(r._id), type: r.type, title: r.type === "url" ? "Suspicious link" : r.type === "phone" ? "Suspicious phone number" : "Suspicious message",
  indicator: r.content.slice(0, 90), status: r.status, reports: r.count, category: r.category,
  confidence: r.count >= 10 ? "high" : r.count >= 3 ? "medium" : "low", updated: r.updated_at.toISOString(), content: r.content,
});

export async function listReports(status?: ReportStatus) {
  const d = await db();
  const docs = await d.collection<ReportDoc>("reports").find(status ? { status } : {}).sort({ updated_at: -1 }).limit(100).toArray();
  return docs.map(serializeReport);
}

export async function setReportStatus(id: string, status: ReportStatus) {
  if (!ObjectId.isValid(id)) return false;
  const d = await db();
  const r = await d.collection<ReportDoc>("reports").updateOne({ _id: new ObjectId(id) }, { $set: { status, updated_at: new Date() } });
  return r.matchedCount === 1;
}

export async function stats() {
  const d = await db();
  const since = new Date(Date.now() - 13 * 864e5); since.setHours(0, 0, 0, 0);
  const [total, week, byRisk, daily, pending, recent] = await Promise.all([
    d.collection("scans").countDocuments(),
    d.collection("scans").countDocuments({ created_at: { $gte: new Date(Date.now() - 7 * 864e5) } }),
    d.collection("scans").aggregate([{ $group: { _id: "$risk_level", n: { $sum: 1 } } }]).toArray(),
    d.collection("scans").aggregate([{ $match: { created_at: { $gte: since } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } }, n: { $sum: 1 } } }]).toArray(),
    d.collection("reports").countDocuments({ status: "pending" }),
    d.collection("scans").find({}, { projection: { _id: 0, risk_level: 1, input_type: 1, language: 1, scam_type: 1, created_at: 1 } }).sort({ created_at: -1 }).limit(6).toArray(),
  ]);
  const map = new Map(daily.map((x) => [x._id as string, x.n as number]));
  const series = Array.from({ length: 14 }, (_, i) => { const t = new Date(since.getTime() + i * 864e5); return map.get(t.toISOString().slice(0, 10)) ?? 0; });
  const risk = Object.fromEntries(byRisk.map((x) => [x._id as string, x.n as number]));
  return { total, week, risk, series, pending, recent };
}
