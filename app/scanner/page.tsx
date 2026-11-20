"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck, Languages, FileSearch } from "lucide-react";
import ScanBox from "@/components/ScanBox";
import Reveal from "@/components/Reveal";
import { IMG } from "@/lib/images";

export default function ScannerPage() {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden">
        <Image src={IMG.lake(1900)} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-paper/55 via-paper/80 to-paper" />
      </div>
      <section className="mx-auto max-w-4xl px-4 pb-8 pt-36 sm:px-6">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-pine-2">Scanner</motion.p>
        <h1 className="mt-3 text-balance text-center font-display text-4xl font-medium leading-[1.1] tracking-tight sm:text-6xl">Take a breath.<br /><span className="italic text-pine-2">Then check it here.</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-center text-lg text-ink-soft">Paste a message, a link or a screenshot. We will show exactly what looks concerning — and what to do next.</p>
        <div className="mt-10"><ScanBox /></div>
      </section>
      <section className="mx-auto grid max-w-4xl gap-4 px-4 pb-8 sm:grid-cols-3 sm:px-6">
        {[
          { Icon: FileSearch, t: "Evidence, not guesses", d: "Every warning points to the exact words or link features behind it." },
          { Icon: Languages, t: "Bangla · English · Banglish", d: "Written the way people actually write, mixed scripts included." },
          { Icon: ShieldCheck, t: "Honest about limits", d: "We never call anything “safe” — only what we did or did not find." },
        ].map((f, i) => (
          <Reveal key={f.t} delay={i * 0.08}>
            <div className="hairline h-full rounded-3xl bg-white/60 p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-mist text-pine"><f.Icon size={20} /></span>
              <h3 className="mt-4 font-display text-lg font-medium">{f.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{f.d}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
