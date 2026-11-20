"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, ScanSearch, Link2, MessageSquareText, ImageIcon, BookOpenCheck, Lightbulb, ArrowRight, Leaf } from "lucide-react";
import { fetchScans, removeScan } from "@/services/api";
import RiskBadge from "@/components/RiskBadge";
import Reveal from "@/components/Reveal";
import { useLang } from "@/lib/i18n";
import type { ScanResult } from "@/types";

const TIPS = [
  ["No real service asks for your OTP", "bKash, Nagad and banks never need your OTP or PIN in a message or call."],
  ["Pause when you feel rushed", "Urgency is the scammer’s main tool. A genuine problem can wait five minutes."],
  ["Verify through the official app", "Open the app yourself rather than tapping a link in a message."],
];
const Icons = { message: MessageSquareText, url: Link2, image: ImageIcon };

export default function Dashboard() {
  const { bi, t } = useLang();
  const [scans, setScans] = useState<ScanResult[] | null>(null);
  useEffect(() => { fetchScans().then(setScans); }, []);
  const del = async (id: string) => { await removeScan(id); setScans((s) => s?.filter((x) => x.scan_id !== id) ?? []); };
  const count = (l: string) => scans?.filter((s) => s.risk_level === l).length ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-8 pt-36">
      <Reveal><p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine-2">My Shield</p>
        <h1 className="mt-3 font-display text-5xl font-medium tracking-tight sm:text-6xl">Your protection <span className="italic text-pine-2">center</span></h1>
        <p className="mt-4 max-w-xl text-lg text-ink-soft">Recent scans and awareness tips. Everything here is stored privately on this device.</p></Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-4">
        {[["Checked", scans?.length ?? 0, "bg-mist text-pine"], ["High risk", count("high"), "bg-clay/10 text-clay"], ["Suspicious", count("suspicious"), "bg-amber/10 text-amber"], ["Needs verification", count("verify"), "bg-slate/10 text-slate"]].map(([l, n, c], i) => (
          <Reveal key={l as string} delay={i * 0.07}><div className="hairline rounded-3xl bg-white/70 p-5"><p className="text-sm text-muted">{l}</p>
            <motion.p key={String(n)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`mt-2 inline-block rounded-2xl px-3 py-1 font-display text-4xl ${c}`}>{n as number}</motion.p></div></Reveal>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-2xl font-medium">Recent scans</h2>
            <Link href="/scanner" className="inline-flex items-center gap-1.5 text-sm font-semibold text-pine hover:underline"><ScanSearch size={15} /> New check</Link></div>
          {scans && scans.length === 0 ? (
            <Reveal><div className="hairline grid place-items-center rounded-[2rem] bg-white/60 px-6 py-16 text-center">
              <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }} className="grid h-16 w-16 place-items-center rounded-full bg-mist text-pine"><Leaf size={28} /></motion.span>
              <h3 className="mt-5 font-display text-2xl">All quiet here</h3>
              <p className="mt-2 max-w-xs text-ink-soft">When you check something, it will appear here — privately, only on this device.</p>
              <Link href="/scanner" className="mt-6 inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-paper">Check something <ArrowRight size={15} /></Link></div></Reveal>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {scans?.map((s, i) => {
                  const I = Icons[s.input_type];
                  return (
                    <motion.li key={s.scan_id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ delay: Math.min(i, 6) * 0.05 }} className="hairline group flex items-center gap-4 rounded-3xl bg-white/75 p-4 transition-shadow hover:shadow-soft">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mist text-pine"><I size={19} /></span>
                      <Link href={`/result/${s.scan_id}`} className="min-w-0 flex-1">
                        <p className="truncate font-medium">{s.input_preview}</p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-muted">{new Date(s.created_at).toLocaleString()}</p>
                      </Link>
                      <RiskBadge level={s.risk_level} size="sm" />
                      <button onClick={() => del(s.scan_id)} aria-label="Delete scan" className="grid h-9 w-9 place-items-center rounded-full text-muted opacity-60 transition hover:bg-clay/10 hover:text-clay group-hover:opacity-100"><Trash2 size={16} /></button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </section>
        <aside>
          <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-medium"><Lightbulb size={20} className="text-amber" /> Stay aware</h2>
          <div className="space-y-3">
            {TIPS.map(([h, d], i) => (
              <Reveal key={h} delay={i * 0.08}><div className="rounded-3xl bg-sand/45 p-5"><h3 className="flex items-center gap-2 font-semibold"><BookOpenCheck size={16} className="text-pine-2" />{h}</h3><p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{d}</p></div></Reveal>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted">{t("scan.privacy")}</p>
        </aside>
      </div>
    </div>
  );
}
