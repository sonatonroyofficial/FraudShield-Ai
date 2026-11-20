"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Link2, MessageSquareText, Phone, Flag, TriangleAlert, CheckCircle2, Clock, Search, Info, Send } from "lucide-react";
import Reveal from "@/components/Reveal";
import { IMG } from "@/lib/images";
import { loadReports, saveReport } from "@/lib/store";
import type { CommunityReport } from "@/types";

const SEED: CommunityReport[] = [
  { id: "r1", type: "message", title: "Fake mobile-banking suspension notice", indicator: "“account will be suspended today”", confidence: "high", status: "approved", reports: 42, category: "Phishing", updated: "2 days ago" },
  { id: "r2", type: "url", title: "Look-alike payment login page", indicator: "bkash-secure-verify.xyz", confidence: "high", status: "approved", reports: 27, category: "Credential theft", updated: "3 days ago" },
  { id: "r3", type: "message", title: "Job offer asking for a registration fee", indicator: "“registration fee before joining”", confidence: "medium", status: "approved", reports: 18, category: "Job scam", updated: "5 days ago" },
  { id: "r4", type: "phone", title: "Caller claiming to be customer support", indicator: "Asks for OTP over the phone", confidence: "medium", status: "approved", reports: 11, category: "Impersonation", updated: "1 week ago" },
  { id: "r5", type: "message", title: "“Double your money” investment group", indicator: "“guaranteed daily profit”", confidence: "low", status: "approved", reports: 6, category: "Investment", updated: "1 week ago" },
];
const TRENDS = [["Phishing", 82], ["Job scam", 54], ["Impersonation", 47], ["Investment", 31], ["Fake seller", 26]] as const;
const conf = { high: "bg-clay/10 text-clay", medium: "bg-amber/10 text-amber", low: "bg-slate/10 text-slate" };
const TypeIcon = { message: MessageSquareText, url: Link2, phone: Phone };

export default function CommunityPage() {
  const [mine, setMine] = useState<CommunityReport[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"message" | "url" | "phone">("message");
  const [content, setContent] = useState("");
  const [ok, setOk] = useState(false);
  useEffect(() => setMine(loadReports()), []);

  const list = SEED.filter((r) => (r.title + r.indicator + r.category).toLowerCase().includes(q.toLowerCase()));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 4) return;
    const r: CommunityReport = { id: "u" + Date.now(), type, title: type === "url" ? "Suspicious link" : type === "phone" ? "Suspicious phone number" : "Suspicious message", indicator: content.slice(0, 80), confidence: "low", status: "pending", reports: 1, category: "Awaiting review", updated: "just now" };
    saveReport(r); setMine([r, ...mine]); setContent(""); setOk(true); setTimeout(() => setOk(false), 5000);
  };

  return (
    <div>
      <section className="relative isolate overflow-hidden px-6 pb-20 pt-36 text-center">
        <Image src={IMG.field(1900)} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-paper/60 via-paper/80 to-paper" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine-2">Community</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-balance font-display text-5xl font-medium leading-[1.08] tracking-tight sm:text-6xl">Moderated alerts, <span className="italic text-pine-2">shared with care.</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">A report is an allegation, not proof. Every alert here shows its confidence and has been reviewed before it is shared.</p>
        <p className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs text-muted"><Info size={14} /> Illustrative demo data — no live community yet.</p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0">
          <div className="glass flex items-center gap-3 rounded-full px-5 shadow-soft"><Search size={18} className="text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search alerts, domains or categories…" aria-label="Search alerts" className="h-14 w-full bg-transparent outline-none placeholder:text-muted/80" /></div>
          <div className="mt-6 space-y-4">
            <AnimatePresence initial={false}>
              {[...mine, ...list].map((r, i) => {
                const I = TypeIcon[r.type];
                return (
                  <motion.article key={r.id} layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: Math.min(i, 5) * 0.06, duration: 0.6 }} whileHover={{ y: -3 }}
                    className="hairline rounded-[1.6rem] bg-white/75 p-5 transition-shadow hover:shadow-soft">
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mist text-pine"><I size={20} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{r.title}</h3>
                          {r.status === "pending" ? <span className="inline-flex items-center gap-1 rounded-full bg-paper-2 px-2.5 py-0.5 text-xs font-medium text-muted"><Clock size={12} /> Pending review</span>
                            : <span className="inline-flex items-center gap-1 rounded-full bg-moss/10 px-2.5 py-0.5 text-xs font-medium text-moss"><CheckCircle2 size={12} /> Reviewed</span>}
                        </div>
                        <p className="mt-1.5 break-all font-mono text-[13px] text-ink-soft">{r.indicator}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className={`rounded-full px-2.5 py-1 font-semibold ${conf[r.confidence]}`}>{r.confidence} confidence</span>
                          <span className="rounded-full bg-paper-2 px-2.5 py-1 font-medium text-ink-soft">{r.category}</span>
                          <span className="text-muted">{r.reports} report{r.reports > 1 ? "s" : ""} · {r.updated}</span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
            {list.length === 0 && mine.length === 0 && <p className="py-10 text-center text-muted">No alerts match your search.</p>}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <div className="hairline rounded-[1.8rem] bg-white/75 p-6">
              <h2 className="font-display text-2xl font-medium">Trending campaigns</h2>
              <p className="mt-1 text-xs text-muted">Relative activity · illustrative</p>
              <ul className="mt-5 space-y-4">
                {TRENDS.map(([n, v], i) => (
                  <li key={n}><div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{n}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-mist"><motion.div initial={{ width: 0 }} whileInView={{ width: `${v}%` }} viewport={{ once: true }} transition={{ duration: 1.3, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-gradient-to-r from-sage to-pine-2" /></div></li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <form id="report" onSubmit={submit} className="scroll-mt-28 rounded-[1.8rem] bg-pine p-6 text-paper shadow-lift">
              <h2 className="flex items-center gap-2 font-display text-2xl font-medium"><Flag size={20} className="text-sage" /> Report suspicious content</h2>
              <p className="mt-2 flex gap-2 rounded-xl bg-white/10 p-3 text-[13px] leading-snug text-paper/85"><TriangleAlert size={16} className="mt-0.5 shrink-0 text-amber" /> Never include OTPs, passwords, account numbers or unnecessary personal information.</p>
              <div className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-white/10 p-1 text-sm">
                {(["message", "url", "phone"] as const).map((t) => (
                  <button type="button" key={t} onClick={() => setType(t)} className={`rounded-full py-2 font-medium capitalize transition ${type === t ? "bg-paper text-pine" : "text-paper/75 hover:text-paper"}`}>{t === "url" ? "Link" : t}</button>
                ))}
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} placeholder={type === "url" ? "Paste the suspicious link" : type === "phone" ? "Phone number and what happened" : "Paste the suspicious message"} aria-label="Report content"
                className="mt-3 w-full resize-none rounded-2xl border border-white/15 bg-white/10 p-3.5 text-[15px] text-paper outline-none placeholder:text-paper/50 focus:border-sage focus:bg-white/15" />
              <button className="group mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-paper px-5 py-3.5 text-sm font-semibold text-pine transition hover:scale-[1.02]"><Send size={15} /> Submit for review</button>
              <AnimatePresence>{ok && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 flex items-center gap-2 text-sm text-sage"><CheckCircle2 size={16} /> Thank you. Stored as pending review — it stays private until approved.</motion.p>}</AnimatePresence>
            </form>
          </Reveal>
        </aside>
      </section>
    </div>
  );
}
