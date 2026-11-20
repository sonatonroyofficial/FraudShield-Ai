import { getDb } from "@/lib/mongodb";
import { stats } from "./repo";
import { FEATURE_CATALOG } from "./docsDefaults";
import type { LiveSnapshot } from "@/lib/docsTypes";

let cache: { at: number; data: LiveSnapshot } | null = null;

/** Real, privacy-safe snapshot of system state. Only booleans and aggregate counts leave the server. */
export async function liveSnapshot(): Promise<LiveSnapshot> {
  if (cache && Date.now() - cache.at < 30_000) return cache.data;
  const llm = !!process.env.OPENAI_API_KEY, threat = !!process.env.WEB_RISK_API_KEY;
  let db = false, scans: LiveSnapshot["scans"] = null, reports: LiveSnapshot["reports"] = null;
  try {
    const s = await stats();
    db = true;
    scans = { total: s.total, week: s.week, today: s.series[s.series.length - 1] ?? 0, risk: s.risk, series: s.series };
    reports = { approved: await (await getDb()).collection("reports").countDocuments({ status: "approved" }) };
  } catch { /* database unreachable → numbers stay null and features that need it show as degraded */ }

  const features = FEATURE_CATALOG.map(({ needs, ...f }) => {
    if (f.status !== "live") return f;
    if (needs === "llm" && !llm) return { ...f, status: "degraded" as const, note: "AI key not configured — rule-based fallback" };
    if (needs === "db" && !db) return { ...f, status: "degraded" as const, note: "Database unreachable" };
    if (needs === "threat" && !threat) return { ...f, status: "degraded" as const, note: "Threat-intel key not configured" };
    return f;
  });
  const data: LiveSnapshot = { generated_at: new Date().toISOString(), engine: { llm, threat_intel: threat, db, vision: llm }, scans, reports, features };
  cache = { at: Date.now(), data };
  return data;
}
