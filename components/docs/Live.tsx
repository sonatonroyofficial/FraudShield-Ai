"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Clock, CalendarClock, Cpu, Database, Radar, ScanText } from "lucide-react";
import type { FeatureStatus, LiveSnapshot } from "@/lib/docsTypes";

const Ctx = createContext<{ live: LiveSnapshot | null; err: boolean }>({ live: null, err: false });
export const useLive = () => useContext(Ctx);

export function LiveProvider({ children }: { children: React.ReactNode }) {
  const [live, setLive] = useState<LiveSnapshot | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let on = true;
    const load = () => fetch("/api/docs/live").then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => { if (on) { setLive(d); setErr(false); } }).catch(() => on && setErr(true));
    load(); const id = setInterval(load, 30_000);
    return () => { on = false; clearInterval(id); };
  }, []);
  return <Ctx.Provider value={{ live, err }}>{children}</Ctx.Provider>;
}

export function LivePill() {
  const { live, err } = useLive();
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft">
      <span className="relative flex h-2 w-2"><span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${err ? "bg-clay/50" : "bg-moss/60"}`} /><span className={`relative inline-flex h-2 w-2 rounded-full ${err ? "bg-clay" : "bg-moss"}`} /></span>
      {err ? "Live data unavailable" : live ? `Live · ${new Date(live.generated_at).toLocaleTimeString()}` : "Connecting…"}
    </span>
  );
}

const ST: Record<FeatureStatus, { label: string; cls: string; Icon: typeof Clock }> = {
  live: { label: "Live", cls: "bg-moss/10 text-moss", Icon: CheckCircle2 },
  degraded: { label: "Degraded", cls: "bg-amber/10 text-amber", Icon: AlertTriangle },
  upcoming: { label: "Upcoming", cls: "bg-slate/10 text-slate", Icon: Clock },
  planned: { label: "Planned", cls: "bg-paper-2 text-ink-soft", Icon: CalendarClock },
};

export function FeatureMatrix() {
  const { live } = useLive();
  if (!live) return <p className="text-sm text-muted">Loading live feature status…</p>;
  const groups: [string, FeatureStatus[]][] = [["Current", ["live", "degraded"]], ["Upcoming", ["upcoming"]], ["Planned", ["planned"]]];
  return (
    <div className="space-y-8">
      {groups.map(([g, sts]) => {
        const rows = live.features.filter((f) => sts.includes(f.status));
        if (!rows.length) return null;
        return (
          <div key={g}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-muted">{g}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {rows.map((f, i) => { const s = ST[f.status]; return (
                <motion.div key={f.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.05 }} className="rounded-2xl border border-line bg-white p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3"><h4 className="font-semibold text-ink">{f.name}</h4><span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}><s.Icon size={12} />{s.label}</span></div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
                  {f.note && <p className="mt-2 text-xs text-amber">{f.note}</p>}
                </motion.div>); })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const RISK = [["high", "High risk", "#c0594a"], ["suspicious", "Suspicious", "#c68a2a"], ["verify", "Needs verification", "#5a7a98"], ["none", "No known threat", "#5c8b78"]] as const;

export function LiveStats() {
  const { live, err } = useLive();
  if (err) return <p className="text-sm text-clay">Live data is unavailable right now.</p>;
  if (!live) return <p className="text-sm text-muted">Loading live data…</p>;
  const e = live.engine;
  const checks = [[Cpu, "Contextual AI", e.llm], [ScanText, "Vision OCR", e.vision], [Radar, "Threat intel", e.threat_intel], [Database, "Database", e.db]] as const;
  const s = live.scans; const max = s ? Math.max(1, ...s.series) : 1;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {checks.map(([I, l, ok]) => (
          <div key={l} className="rounded-2xl border border-line bg-white p-4"><div className="flex items-center justify-between"><I size={18} className="text-pine-2" /><span className={`h-2.5 w-2.5 rounded-full ${ok ? "bg-moss" : "bg-amber"}`} /></div><p className="mt-3 text-sm font-semibold">{l}</p><p className="text-xs text-muted">{ok ? "Operational" : "Not configured / unreachable"}</p></div>
        ))}
      </div>
      {s ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[["Total scans", s.total], ["Last 7 days", s.week], ["Today", s.today], ["Approved alerts", live.reports?.approved ?? 0]].map(([l, v]) => (
              <div key={l as string} className="rounded-2xl border border-line bg-white p-4"><p className="font-display text-3xl font-medium text-ink">{(v as number).toLocaleString()}</p><p className="text-xs text-muted">{l}</p></div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-5"><p className="mb-3 text-sm font-semibold">Scans per day · last 14 days</p>
              <div className="flex h-24 items-end gap-1.5">{s.series.map((v, i) => <motion.span key={i} initial={{ height: 0 }} whileInView={{ height: `${Math.max(4, (v / max) * 100)}%` }} viewport={{ once: true }} transition={{ delay: i * 0.04, duration: 0.6 }} className="flex-1 rounded-t-md bg-gradient-to-t from-pine-2 to-sage" title={`${v}`} />)}</div></div>
            <div className="rounded-2xl border border-line bg-white p-5"><p className="mb-3 text-sm font-semibold">Risk distribution</p>
              <ul className="space-y-2.5">{RISK.map(([k, n, c]) => { const v = s.risk[k] ?? 0; const p = s.total ? Math.round((v / s.total) * 100) : 0; return (
                <li key={k}><div className="mb-1 flex justify-between text-xs"><span>{n}</span><span className="text-muted">{v} · {p}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-mist"><motion.div initial={{ width: 0 }} whileInView={{ width: `${p}%` }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: c }} /></div></li>); })}</ul></div>
          </div>
        </>
      ) : <p className="rounded-2xl bg-sand/50 p-4 text-sm text-ink-soft">Scan statistics are unavailable because the database cannot be reached right now. Engine status above is still live.</p>}
    </div>
  );
}
