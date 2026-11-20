"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

export default function LoadingState() {
  const { t } = useLang();
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => Math.min(3, x + 1)), 650); return () => clearInterval(id); }, []);
  const keys = ["loading.1", "loading.2", "loading.3", "loading.4"] as const;
  return (
    <div className="flex flex-col items-center justify-center gap-7 py-14 text-center" role="status" aria-live="polite">
      <div className="relative grid h-28 w-28 place-items-center">
        {[0, 1, 2].map((n) => (
          <motion.span key={n} className="absolute inset-0 rounded-full border border-pine-2/40"
            initial={{ scale: 0.5, opacity: 0.7 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 2.8, repeat: Infinity, delay: n * 0.9, ease: "easeOut" }} />
        ))}
        <motion.div className="relative grid h-16 w-16 place-items-center rounded-full bg-pine shadow-lift" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><path d="M16 3 6 7v8c0 6 4 10.800 10 13.500C22 25.800 26 21 26 15V7L16 3Z" stroke="#bfe0d1" strokeWidth="2" /></svg>
        </motion.div>
      </div>
      <div className="h-7">
        <AnimatePresence mode="wait">
          <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }} className="font-display text-xl text-ink">
            {t(keys[i])}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-mist">
        <motion.div className="h-full rounded-full bg-pine-2" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2.4, ease: "easeInOut" }} />
      </div>
    </div>
  );
}
