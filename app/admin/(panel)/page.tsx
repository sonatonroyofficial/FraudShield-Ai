"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { LayoutDashboard, ListChecks, Activity, LogOut, Bell, Search, ScanSearch, ShieldAlert, Flag, Users, TrendingUp, TrendingDown,
  Check, X, MessageCircleQuestion, Cpu, ScanText, Radar, Database, Menu, Info, Globe } from "lucide-react";
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

const KPIS = [
  { l: "Scans (7 days)", v: 12480, d: "+12.4%", up: true, Icon: ScanSearch, c: "text-pine bg-mist" },
  { l: "High-risk found", v: 1932, d: "+4.1%", up: true, Icon: ShieldAlert, c: "text-clay bg-clay/10" },
  { l: "Reports pending", v: 4, d: "-18%", up: false, Icon: Flag, c: "text-amber bg-amber/10" },
  { l: "Active users", v: 3270, d: "+8.7%", up: true, Icon: Users, c: "text-slate bg-slate/10" },
];
const SERIES = [38, 52, 47, 66, 58, 79, 72, 91, 84, 102, 96, 118, 109, 126];
const RISK = [{ n: "High risk", v: 18, c: "#c0594a" }, { n: "Suspicious", v: 29, c: "#c68a2a" }, { n: "Needs verification", v: 33, c: "#5a7a98" }, { n: "No known threat", v: 20, c: "#5c8b78" }];
const ACTIVITY = [
  ["Report approved", "bkash-secure-verify.xyz", "2 min ago", "text-moss bg-moss/10"],
  ["High-risk scan", "Message · Banglish", "9 min ago", "text-clay bg-clay/10"],
  ["Report submitted", "Job offer with fee", "21 min ago", "text-amber bg-amber/10"],
  ["Duplicate merged", "3 similar URL reports", "1 h ago", "text-slate bg-slate/10"],
  ["Report rejected", "Insufficient evidence", "3 h ago", "text-ink-soft bg-paper-2"],
];

function Chart() {
  const w = 640, h = 220, max = 140;
  const pts = SERIES.map((v, i) => [(i / (SERIES.length - 1)) * w, h - (v / max) * (h - 20) - 6]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full" preserveAspectRatio="none" role="img" aria-label="Scans per day, last 14 days (illustrative)">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b6358" stopOpacity=".35" /><stop offset="1" stopColor="#2b6358" stopOpacity="0" /></linearGradient></defs>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="#dcd8ca" strokeDasharray="4 6" />)}
      <motion.path d={area} fill="url(#ag)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 1 }} />
      <motion.path d={line} fill="none" stroke="#1f4d45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, ease: "easeInOut" }} />
      {pts.map((p, i) => <motion.circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 5 : 0} fill="#1f4d45" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 }} />)}
    </svg>
  );
}

function Donut() {
  const r = 52, C = 2 * Math.PI * r; let acc = 0;
  return (
    <div className="flex items-center gap-6">
      <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90 shrink-0">
        <circle cx="75" cy="75" r={r} fill="none" stroke="#e4ede8" strokeWidth="16" />
        {RISK.map((s, i) => { const len = (s.v / 100) * C; const el = (
          <motion.circle key={s.n} cx="75" cy="75" r={r} fill="none" stroke={s.c} strokeWidth="16" strokeDasharray={`${len - 3} ${C}`} strokeDashoffset={-acc}
            initial={{ opacity: 0, pathLength: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.15, duration: 0.8 }} />); acc += len; return el; })}
      </svg>
      <ul className="space-y-2.5 text-sm">{RISK.map((s) => <li key={s.n} className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: s.c }} /><span className="text-ink-soft">{s.n}</span><span className="ml-auto pl-3 font-semibold">{s.v}%</span></li>)}</ul>
    </div>
  );
}

function Card({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className={`rounded-3xl border border-line bg-white p-6 shadow-soft ${className}`}>{children}</motion.div>;
}

function Overview() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((k, i) => (
          <Card key={k.l} delay={i * 0.08} className="group transition hover:-translate-y-1 hover:shadow-lift">
            <div className="flex items-center justify-between"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${k.c}`}><k.Icon size={20} /></span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${k.up ? "bg-moss/10 text-moss" : "bg-slate/10 text-slate"}`}>{k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{k.d}</span></div>
            <p className="mt-5 font-display text-4xl font-medium tracking-tight"><Counter to={k.v} /></p>
            <p className="mt-1 text-sm text-muted">{k.l}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <Card delay={0.3}><div className="flex items-center justify-between"><div><h3 className="font-display text-xl font-medium">Scan volume</h3><p className="text-sm text-muted">Last 14 days</p></div><span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-pine">Daily</span></div><div className="mt-4"><Chart /></div></Card>
        <Card delay={0.4}><h3 className="font-display text-xl font-medium">Risk distribution</h3><p className="mb-5 text-sm text-muted">Share of completed scans</p><Donut /></Card>
      </div>
      <Card delay={0.5}>
        <h3 className="font-display text-xl font-medium">Recent activity</h3>
        <ul className="mt-4 divide-y divide-line">
          {ACTIVITY.map(([a, b, t, c], i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.08 }} className="flex items-center gap-4 py-3.5">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${c}`}>{a}</span><span className="min-w-0 flex-1 truncate text-sm text-ink-soft">{b}</span><span className="shrink-0 text-xs text-muted">{t}</span>
            </motion.li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

type Item = { id: string; title: string; indicator: string; dupes: number; kind: string; state: "pending" | "approved" | "rejected" | "more-info" };
const INIT: Item[] = [
  { id: "a1", title: "Fake account-suspension SMS", indicator: "bkash-secure-verify.xyz", dupes: 9, kind: "URL", state: "pending" },
  { id: "a2", title: "Job offer with advance fee", indicator: "“pay 500 tk registration fee”", dupes: 4, kind: "Message", state: "pending" },
  { id: "a3", title: "Caller asking for OTP", indicator: "01XXXXXXXXX (masked)", dupes: 2, kind: "Phone", state: "pending" },
  { id: "a4", title: "Cashback prize notification", indicator: "“you have won cashback”", dupes: 1, kind: "Message", state: "pending" },
];
function Moderation() {
  const [items, setItems] = useState(INIT);
  const set = (id: string, state: Item["state"]) => setItems((l) => l.map((i) => (i.id === id ? { ...i, state } : i)));
  const label = { approved: "Approved", rejected: "Rejected", "more-info": "More info requested", pending: "" };
  const tone = { approved: "bg-moss/10 text-moss", rejected: "bg-clay/10 text-clay", "more-info": "bg-slate/10 text-slate", pending: "" };
  return (
    <div>
      <p className="mb-5 flex items-start gap-2 rounded-2xl bg-sand/50 p-4 text-sm text-ink-soft"><Info size={17} className="mt-0.5 shrink-0" /> A community report is an allegation, not proof. Approve only with sufficient evidence and never label a person or business as criminal.</p>
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {items.map((it, i) => (
            <motion.li key={it.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 shadow-soft sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{it.title}</h3><span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-xs font-medium text-ink-soft">{it.kind}</span>
                  {it.dupes > 1 && <span className="rounded-full bg-amber/10 px-2.5 py-0.5 text-xs font-medium text-amber">{it.dupes} similar</span>}</div>
                <p className="mt-1.5 break-all font-mono text-[13px] text-ink-soft">{it.indicator}</p>
              </div>
              {it.state === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => set(it.id, "approved")} className="inline-flex items-center gap-1.5 rounded-full bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-pine-2"><Check size={15} /> Approve</button>
                  <button onClick={() => set(it.id, "more-info")} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-4 py-2.5 text-sm font-semibold text-pine transition hover:bg-sage/40"><MessageCircleQuestion size={15} /> Ask</button>
                  <button onClick={() => set(it.id, "rejected")} className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-clay hover:text-clay"><X size={15} /> Reject</button>
                </div>
              ) : (
                <div className="flex items-center gap-3"><motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${tone[it.state]}`}>{label[it.state]}</motion.span>
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
      </nav>
      <div className="mt-auto space-y-3">
        <div className="rounded-2xl bg-white/10 p-4 text-xs leading-relaxed text-paper/70"><Globe size={15} className="mb-2 text-sage" />Figures shown are illustrative until the backend is connected.</div>
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
          <div className="min-w-0 flex-1"><h1 className="font-display text-2xl font-medium leading-none tracking-tight">{title}</h1><p className="mt-1 hidden text-xs text-muted sm:block">FraudShield AI · Admin console</p></div>
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
