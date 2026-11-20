"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { LayoutDashboard, ListChecks, Activity, LogOut, Bell, Search, ScanSearch, ShieldAlert, Flag, Users, TrendingUp, TrendingDown,
  Check, X, MessageCircleQuestion, Cpu, ScanText, Radar, Database, Menu, Info, Globe, BookOpen } from "lucide-react";
import Logo from "@/components/Logo";

type View = "overview" | "moderation" | "system";
const NAV = [
  { id: "overview" as const, label: "Overview", Icon: LayoutDashboard },
  { id: "moderation" as const, label: "Moderation", Icon: ListChecks },
  { id: "system" as const, label: "System", Icon: Activity },
];

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const v = useMotionValue(0);
  const text = useTransform(v, (x) => Math.round(x).toLocaleString() + suffix);
  useEffect(() => { const c = animate(v, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1] }); return () => c.stop(); }, [to, v]);
  return <motion.span>{text}</motion.span>;
}

interface Stats { total: number; week: number; risk: Record<string, number>; series: number[]; pending: number; recent: { risk_level: string; input_type: string; language: string; scam_type: string | null; created_at: string }[] }
const RISK_META = [{ k: "high", n: "High risk", c: "#c0594a" }, { k: "suspicious", n: "Suspicious", c: "#c68a2a" }, { k: "verify", n: "Needs verification", c: "#5a7a98" }, { k: "none", n: "No known threat", c: "#5c8b78" }];
const TONE: Record<string, string> = { high: "text-clay bg-clay/10", suspicious: "text-amber bg-amber/10", verify: "text-slate bg-slate/10", none: "text-moss bg-moss/10" };

function useStats() {
  const [s, setS] = useState<Stats | null | "error">(null);
  useEffect(() => { fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : Promise.reject())).then(setS).catch(() => setS("error")); }, []);
  return s;
}

function Chart({ series }: { series: number[] }) {
  const w = 640, h = 220, max = Math.max(5, ...series) * 1.2;
  const pts = series.map((v, i) => [(i / (series.length - 1)) * w, h - (v / max) * (h - 20) - 6]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full" preserveAspectRatio="none" role="img" aria-label="Scans per day, last 14 days">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b6358" stopOpacity=".35" /><stop offset="1" stopColor="#2b6358" stopOpacity="0" /></linearGradient></defs>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="#dcd8ca" strokeDasharray="4 6" />)}
      <motion.path d={area} fill="url(#ag)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }} />
      <motion.path d={line} fill="none" stroke="#1f4d45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, ease: "easeInOut" }} />
    </svg>
  );
}

function Donut({ risk, total }: { risk: Record<string, number>; total: number }) {
  const r = 52, C = 2 * Math.PI * r; let acc = 0;
  if (!total) return <p className="py-10 text-center text-sm text-muted">No scans yet.</p>;
  return (
    <div className="flex items-center gap-6">
      <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90 shrink-0">
        <circle cx="75" cy="75" r={r} fill="none" stroke="#e4ede8" strokeWidth="16" />
        {RISK_META.map((s, i) => { const v = risk[s.k] ?? 0; const len = (v / total) * C; const el = (
          <motion.circle key={s.k} cx="75" cy="75" r={r} fill="none" stroke={s.c} strokeWidth="16" strokeDasharray={`${Math.max(0, len - 3)} ${C}`} strokeDashoffset={-acc}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.8 }} />); acc += len; return el; })}
      </svg>
      <ul className="space-y-2.5 text-sm">{RISK_META.map((s) => <li key={s.k} className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: s.c }} /><span className="text-ink-soft">{s.n}</span><span className="ml-auto pl-3 font-semibold">{Math.round(((risk[s.k] ?? 0) / total) * 100)}%</span></li>)}</ul>
    </div>
  );
}

function Card({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className={`rounded-3xl border border-line bg-white p-6 shadow-soft ${className}`}>{children}</motion.div>;
}

function Overview() {
  const s = useStats();
  if (s === null) return <p className="py-20 text-center text-muted">Loading live data…</p>;
  if (s === "error") return <Card><h3 className="font-display text-xl">Database unavailable</h3><p className="mt-2 text-ink-soft">Could not read from MongoDB. Check <code>MONGODB_URI</code> in <code>.env.local</code> and your Atlas network access, then reload.</p></Card>;
  const high = s.risk.high ?? 0;
  const kpis = [
    { l: "Scans (7 days)", v: s.week, Icon: ScanSearch, c: "text-pine bg-mist" },
    { l: "Total scans", v: s.total, Icon: Activity, c: "text-slate bg-slate/10" },
    { l: "High-risk found", v: high, Icon: ShieldAlert, c: "text-clay bg-clay/10" },
    { l: "Reports pending", v: s.pending, Icon: Flag, c: "text-amber bg-amber/10" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <Card key={k.l} delay={i * 0.08} className="group transition hover:-translate-y-1 hover:shadow-lift">
            <span className={`grid h-11 w-11 place-items-center rounded-2xl ${k.c}`}><k.Icon size={20} /></span>
            <p className="mt-5 font-display text-4xl font-medium tracking-tight"><Counter to={k.v} /></p>
            <p className="mt-1 text-sm text-muted">{k.l}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <Card delay={0.3}><div className="flex items-center justify-between"><div><h3 className="font-display text-xl font-medium">Scan volume</h3><p className="text-sm text-muted">Last 14 days · live from MongoDB</p></div><span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-pine">Daily</span></div><div className="mt-4"><Chart series={s.series} /></div></Card>
        <Card delay={0.4}><h3 className="font-display text-xl font-medium">Risk distribution</h3><p className="mb-5 text-sm text-muted">Share of all message scans</p><Donut risk={s.risk} total={s.total} /></Card>
      </div>
      <Card delay={0.5}>
        <h3 className="font-display text-xl font-medium">Recent scans</h3>
        <p className="text-xs text-muted">Metadata only — message text is never stored.</p>
        {s.recent.length === 0 ? <p className="py-8 text-center text-sm text-muted">Nothing yet. Run a message scan and it will appear here.</p> : (
          <ul className="mt-4 divide-y divide-line">
            {s.recent.map((r, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.08 }} className="flex items-center gap-4 py-3.5">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TONE[r.risk_level] ?? ""}`}>{RISK_META.find((m) => m.k === r.risk_level)?.n ?? r.risk_level}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">{r.input_type} · {r.language}{r.scam_type ? ` · ${r.scam_type}` : ""}</span>
                <span className="shrink-0 text-xs text-muted">{new Date(r.created_at).toLocaleString()}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

type Status = "pending" | "approved" | "rejected" | "more-info";
type Item = { id: string; title: string; indicator: string; content: string; reports: number; type: string; status: Status };
function Moderation() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [err, setErr] = useState(false);
  const load = () => fetch("/api/admin/reports").then((r) => r.json()).then((d) => { setErr(!!d.unavailable); setItems(d.items ?? []); }).catch(() => { setErr(true); setItems([]); });
  useEffect(() => { load(); }, []);
  const set = async (id: string, status: Status) => {
    const prev = items; setItems((l) => l?.map((i) => (i.id === id ? { ...i, status } : i)) ?? null);
    const r = await fetch("/api/admin/reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!r.ok) setItems(prev);
  };
  const label = { approved: "Approved", rejected: "Rejected", "more-info": "More info requested", pending: "" };
  const tone = { approved: "bg-moss/10 text-moss", rejected: "bg-clay/10 text-clay", "more-info": "bg-slate/10 text-slate", pending: "" };
  return (
    <div>
      <p className="mb-5 flex items-start gap-2 rounded-2xl bg-sand/50 p-4 text-sm text-ink-soft"><Info size={17} className="mt-0.5 shrink-0" /> A community report is an allegation, not proof. Approve only with sufficient evidence and never label a person or business as criminal.</p>
      {items === null && <p className="py-16 text-center text-muted">Loading reports…</p>}
      {err && <Card><h3 className="font-display text-xl">Database unavailable</h3><p className="mt-2 text-ink-soft">Could not read reports from MongoDB.</p></Card>}
      {items && !err && items.length === 0 && <Card><h3 className="font-display text-xl">Queue is empty</h3><p className="mt-2 text-ink-soft">New community reports will appear here for review.</p></Card>}
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {items?.map((it, i) => (
            <motion.li key={it.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 6) * 0.07 }} className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 shadow-soft sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{it.title}</h3><span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-xs font-medium capitalize text-ink-soft">{it.type}</span>
                  {it.reports > 1 && <span className="rounded-full bg-amber/10 px-2.5 py-0.5 text-xs font-medium text-amber">{it.reports} similar</span>}</div>
                <p className="mt-1.5 break-words font-mono text-[13px] text-ink-soft">{it.content}</p>
              </div>
              {it.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => set(it.id, "approved")} className="inline-flex items-center gap-1.5 rounded-full bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-pine-2"><Check size={15} /> Approve</button>
                  <button onClick={() => set(it.id, "more-info")} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-4 py-2.5 text-sm font-semibold text-pine transition hover:bg-sage/40"><MessageCircleQuestion size={15} /> Ask</button>
                  <button onClick={() => set(it.id, "rejected")} className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-clay hover:text-clay"><X size={15} /> Reject</button>
                </div>
              ) : (
                <div className="flex items-center gap-3"><motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${tone[it.status]}`}>{label[it.status]}</motion.span>
                  <button onClick={() => set(it.id, "pending")} className="text-sm text-muted underline-offset-4 hover:underline">Undo</button></div>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function System() {
  const health = [[Cpu, "Analysis API", "Operational", "142 ms"], [ScanText, "OCR service", "Operational", "860 ms"], [Radar, "Threat-intel provider", "Operational", "210 ms"], [Database, "PostgreSQL", "Operational", "18 ms"]] as const;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {health.map(([I, l, s, ms], i) => (
          <Card key={l} delay={i * 0.07}><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-mist text-pine"><I size={20} /></span>
            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss/50" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-moss" /></span></div>
            <p className="mt-4 font-semibold">{l}</p><p className="text-sm text-muted">{s} · {ms}</p></Card>
        ))}
      </div>
      <Card delay={0.3}>
        <h3 className="font-display text-xl font-medium">Provider usage</h3>
        <div className="mt-5 space-y-5">
          {[["LLM API", 64], ["Threat-intelligence API", 41], ["OCR", 27]].map(([n, v], i) => (
            <div key={n as string}><div className="mb-2 flex justify-between text-sm"><span className="font-medium">{n}</span><span className="text-muted">{v}% of monthly quota</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-mist"><motion.div initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 1.2, delay: 0.4 + i * 0.12, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-gradient-to-r from-sage to-pine-2" /></div></div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function AdminPanel() {
  const router = useRouter();
  const [view, setView] = useState<View>("overview");
  const [menu, setMenu] = useState(false);
  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); };
  const title = NAV.find((n) => n.id === view)!.label;

  const Side = (
    <div className="flex h-full flex-col bg-pine p-5 text-paper">
      <Logo light className="px-2 pt-1" />
      <nav className="mt-10 space-y-1">
        {NAV.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => { setView(id); setMenu(false); }} className={`relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${view === id ? "text-pine" : "text-paper/70 hover:text-paper"}`}>
            {view === id && <motion.span layoutId="sidepill" className="absolute inset-0 rounded-2xl bg-paper" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <Icon size={18} className="relative" /><span className="relative">{label}</span>
          </button>
        ))}
        <Link href="/admin/docs" className="relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-paper/70 transition hover:text-paper"><BookOpen size={18} /> Docs &amp; pitch</Link>
      </nav>
      <div className="mt-auto space-y-3">
        <div className="rounded-2xl bg-white/10 p-4 text-xs leading-relaxed text-paper/70"><Globe size={15} className="mb-2 text-sage" />Overview and Moderation use live MongoDB data. System tiles are placeholders.</div>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-paper/80 transition hover:bg-white/10 hover:text-paper"><LogOut size={18} /> Sign out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper-2/60">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{Side}</aside>
      <AnimatePresence>
        {menu && (<>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} className="fixed inset-0 z-40 bg-ink/40 lg:hidden" />
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", stiffness: 300, damping: 34 }} className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">{Side}</motion.aside>
        </>)}
      </AnimatePresence>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-paper/80 px-5 py-4 backdrop-blur-xl sm:px-8">
          <button onClick={() => setMenu(true)} aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft lg:hidden"><Menu size={18} /></button>
          <div className="min-w-0 flex-1"><h1 className="font-display text-2xl font-medium leading-none tracking-tight">{title}</h1><p className="mt-1 hidden text-xs text-muted sm:block">ThreatX AI · Admin console</p></div>
          <div className="hidden items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-muted md:flex"><Search size={15} /> Search…</div>
          <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft"><Bell size={17} /><span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-clay" /></button>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-pine text-sm font-semibold text-paper">A</div>
        </header>
        <main className="px-5 py-7 sm:px-8">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              {view === "overview" && <Overview />}{view === "moderation" && <Moderation />}{view === "system" && <System />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
