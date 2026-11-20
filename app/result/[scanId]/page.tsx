"use client";
import { useEffect, useState, Fragment } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Quote, CheckCircle2, Info, Flag, RotateCcw, Link2, Phone, Bookmark, Cpu, ScanText, Fingerprint, Image as ImageIcon } from "lucide-react";
import { fetchScan } from "@/services/api";
import { SAMPLE_OCR } from "@/lib/analyze";
import { useLang } from "@/lib/i18n";
import RiskBadge, { RISK_STYLE } from "@/components/RiskBadge";
import type { ScanResult } from "@/types";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.11, delayChildren: 0.35 } } };
const item = { hidden: { opacity: 0, y: 22, filter: "blur(6px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } } };

function Highlighted({ text, terms, level }: { text: string; terms: string[]; level: string }) {
  const clean = Array.from(new Set(terms.map((t) => t.trim()).filter((t) => t.length > 1))).sort((a, b) => b.length - a.length);
  if (!clean.length) return <>{text}</>;
  const re = new RegExp(`(${clean.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return <>{text.split(re).map((p, i) => (clean.some((t) => t.toLowerCase() === p.toLowerCase()) ? <mark key={i} className={level === "high" ? "hl" : "hl-amber"}>{p}</mark> : <Fragment key={i}>{p}</Fragment>))}</>;
}

export default function ResultPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const { t, bi, lang } = useLang();
  const [res, setRes] = useState<ScanResult | null | undefined>(undefined);
  useEffect(() => { fetchScan(scanId).then((r) => setRes(r)); }, [scanId]);

  if (res === undefined) return <div className="grid min-h-[70vh] place-items-center pt-24 text-muted">…</div>;
  if (res === null)
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-6 pt-24 text-center">
        <div>
          <h1 className="font-display text-3xl">We couldn’t find that scan</h1>
          <p className="mt-3 text-ink-soft">Scans are private and kept only on this device. It may have been deleted or opened on another device.</p>
          <Link href="/scanner" className="mt-6 inline-flex rounded-full bg-pine px-6 py-3 text-sm font-medium text-paper">Start a new check</Link>
        </div>
      </div>
    );

  const s = RISK_STYLE[res.risk_level];
  const strength = { high: 4, suspicious: 3, verify: 2, none: 1 }[res.risk_level];
  const terms = [...res.indicators.filter((i) => i.match).map((i) => i.match as string), ...res.extracted.urls];
  const typeLabel = { message: t("mode.message"), url: t("mode.url"), image: t("mode.image") }[res.input_type];

  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 -z-10 h-[620px]" style={{ background: `radial-gradient(60% 60% at 50% 0%, ${s.hex}22, transparent 70%)` }} />
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-32 sm:px-6">
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Hero verdict */}
          <motion.section variants={item} className="glass relative overflow-hidden rounded-[2.2rem] p-6 shadow-lift sm:p-10">
            <motion.span aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl" style={{ background: s.hex, opacity: 0.18 }} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 7, repeat: Infinity }} />
            <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
              <div className="mx-auto grid place-items-center">
                <svg width="168" height="168" viewBox="0 0 168 168" className="-rotate-90">
                  <circle cx="84" cy="84" r="72" fill="none" stroke="#e4ede8" strokeWidth="10" />
                  <motion.circle cx="84" cy="84" r="72" fill="none" stroke={s.hex} strokeWidth="10" strokeLinecap="round" strokeDasharray={452}
                    initial={{ strokeDashoffset: 452 }} animate={{ strokeDashoffset: 452 - (452 * strength) / 4 }} transition={{ duration: 1.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} />
                </svg>
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.9, type: "spring", stiffness: 200, damping: 16 }} className={`absolute grid h-20 w-20 place-items-center rounded-full ${s.bg} ${s.text}`}>
                  <s.Icon size={38} strokeWidth={1.6} />
                </motion.div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <RiskBadge level={res.risk_level} />
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1.5 text-xs font-medium text-ink-soft">
                    {res.input_type === "url" ? <Link2 size={13} /> : res.input_type === "image" ? <ImageIcon size={13} /> : <ScanText size={13} />} {typeLabel}
                  </span>
                  <span className="rounded-full bg-paper-2 px-3 py-1.5 text-xs font-medium text-ink-soft">{{ en: "English", bn: "বাংলা", banglish: "Banglish" }[res.language]}</span>
                </div>
                <h1 className="mt-4 text-balance font-display text-3xl font-medium leading-tight tracking-tight sm:text-[2.6rem]">{t(`risk.guide.${res.risk_level}` as "risk.guide.high")}</h1>
                <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-soft">{bi(res.summary)}</p>
                <div className="mt-5 flex items-center gap-3 text-xs font-medium text-muted" aria-label="Evidence strength">
                  <span>Evidence strength</span>
                  <div className="flex gap-1.5">{[1, 2, 3, 4].map((n) => <motion.span key={n} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.7 + n * 0.12 }} className="h-1.5 w-9 origin-left rounded-full" style={{ background: n <= strength ? s.hex : "#e4ede8" }} />)}</div>
                </div>
              </div>
            </div>
            {res.demo_note && <p className="relative mt-6 flex gap-2 rounded-2xl bg-paper-2/80 p-4 text-sm text-ink-soft"><Info size={16} className="mt-0.5 shrink-0" />{bi(res.demo_note)}</p>}
          </motion.section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="min-w-0 space-y-6">
              {/* What was checked */}
              <motion.section variants={item} className="hairline rounded-[1.8rem] bg-white/70 p-6">
                <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted"><Quote size={14} /> {res.input_type === "image" ? "Text read from screenshot" : "What you submitted"}</h2>
                <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-8 text-ink">
                  {res.input_type === "image" ? <Highlighted text={SAMPLE_OCR} terms={terms} level={res.risk_level} /> : <Highlighted text={res.input_preview} terms={terms} level={res.risk_level} />}
                </p>
                {(res.extracted.urls.length > 0 || res.extracted.phones.length > 0) && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                    {res.extracted.urls.map((u) => <span key={u} className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-mist px-3 py-1.5 text-xs font-medium text-pine"><Link2 size={12} />{u}</span>)}
                    {res.extracted.phones.map((p) => <span key={p} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-xs font-medium text-pine"><Phone size={12} />{p}</span>)}
                  </div>
                )}
              </motion.section>

              {/* Indicators */}
              <section>
                <motion.h2 variants={item} className="mb-4 font-display text-2xl font-medium">{t("res.why")}</motion.h2>
                {res.indicators.length === 0 ? (
                  <motion.p variants={item} className="hairline rounded-3xl bg-white/70 p-6 text-ink-soft">{lang === "bn" ? "কোনো সুনির্দিষ্ট সংকেত পাওয়া যায়নি।" : "No specific indicators were found in what you submitted."}</motion.p>
                ) : (
                  <div className="space-y-3">
                    {res.indicators.map((ind, i) => (
                      <motion.article key={i} variants={item} whileHover={{ y: -3 }} className="hairline group relative overflow-hidden rounded-3xl bg-white/80 p-5 transition-shadow hover:shadow-soft">
                        <span className="absolute inset-y-0 left-0 w-1" style={{ background: s.hex, opacity: 0.4 + Math.min(0.6, ind.weight / 50) }} />
                        <div className="flex items-start gap-4">
                          <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${s.bg} ${s.text}`}>{ind.source === "url-rules" ? <Link2 size={17} /> : <Fingerprint size={17} />}</span>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-ink">{bi(ind.name)}</h3>
                            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{bi(ind.reason)}</p>
                            <p className="mt-3 inline-flex max-w-full items-start gap-2 rounded-xl bg-paper px-3 py-2 text-[13px] text-ink"><Cpu size={13} className="mt-0.5 shrink-0 text-muted" /><span className="break-all font-mono text-[12.5px]">{ind.evidence}</span></p>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <motion.section variants={item} className="rounded-[1.8rem] bg-pine p-6 text-paper shadow-lift">
                <h2 className="font-display text-2xl font-medium">{t("res.next")}</h2>
                <ul className="mt-4 space-y-3.5">
                  {res.recommended_actions.map((a, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.12 }} className="flex gap-3 text-[15px] leading-snug text-paper/90"><CheckCircle2 size={19} className="mt-0.5 shrink-0 text-sage" />{bi(a)}</motion.li>
                  ))}
                </ul>
              </motion.section>
              <motion.section variants={item} className="hairline rounded-[1.8rem] bg-sand/40 p-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold"><Info size={16} /> {t("res.limits")}</h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">{res.limitations.map((l, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />{bi(l)}</li>)}</ul>
              </motion.section>
              <motion.div variants={item} className="grid gap-3">
                <Link href="/community#report" className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3.5 text-sm font-semibold transition hover:border-pine-2 hover:shadow-soft"><Flag size={16} /> {t("res.report")}</Link>
                <Link href="/scanner" className="inline-flex items-center justify-center gap-2 rounded-full bg-mist px-5 py-3.5 text-sm font-semibold text-pine transition hover:bg-sage/40"><RotateCcw size={16} /> {t("res.again")}</Link>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted"><Bookmark size={12} /> {t("res.save")}</p>
              </motion.div>
            </aside>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
