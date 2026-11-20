"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, Link2, Clock, KeyRound } from "lucide-react";

const parts: { t: string; k?: number }[] = [
  { t: "Dear Customer, Your mobile banking account " },
  { t: "will be suspended today", k: 0 },
  { t: ". " },
  { t: "Verify immediately", k: 1 },
  { t: " using the link below: " },
  { t: "bkash-secure-verify.xyz", k: 2 },
];
const chips = [
  { Icon: Clock, label: "Urgency & fear", tone: "text-clay bg-clay/10" },
  { Icon: KeyRound, label: "Verification pressure", tone: "text-amber bg-amber/10" },
  { Icon: Link2, label: "Look-alike domain", tone: "text-clay bg-clay/10" },
];

export default function HeroDemo() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s >= 5 ? 0 : s + 1)), 1500);
    return () => clearInterval(id);
  }, []);
  const shown = Math.min(step, 3);
  return (
    <div className="glass relative w-full max-w-[22rem] overflow-hidden rounded-[1.7rem] p-5 shadow-lift">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss/60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-moss" /></span>
          Live analysis
        </span>
        <span className="text-[11px] text-muted">Illustrative</span>
      </div>
      <p className="relative mt-4 rounded-2xl bg-white/80 p-4 text-[14px] leading-7 text-ink">
        {parts.map((p, i) =>
          p.k === undefined ? <span key={i}>{p.t}</span> : (
            <motion.mark key={i} animate={{ backgroundSize: shown > p.k ? "100% 100%" : "0% 100%" }} transition={{ duration: 0.7 }}
              style={{ backgroundColor: "transparent", backgroundImage: "linear-gradient(rgb(192 89 74 / .26), rgb(192 89 74 / .26))", backgroundRepeat: "no-repeat", backgroundPosition: "0 100%", color: "inherit", borderRadius: 4, padding: "0 2px" }}>{p.t}</motion.mark>
          ))}
        <span className="pointer-events-none absolute inset-x-0 h-8 animate-scan bg-gradient-to-b from-transparent via-sage/35 to-transparent" />
      </p>
      <div className="mt-4 space-y-2">
        <AnimatePresence>
          {chips.slice(0, shown).map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, x: -14, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium ${c.tone}`}><c.Icon size={15} /> {c.label}</motion.div>
          ))}
        </AnimatePresence>
      </div>
      <motion.div animate={{ opacity: shown === 3 ? 1 : 0.25 }} className="mt-4 flex items-center gap-2 rounded-xl bg-pine px-3.5 py-2.5 text-sm font-medium text-paper">
        <ShieldAlert size={16} className="text-sage" /> High risk · verify independently
      </motion.div>
    </div>
  );
}
