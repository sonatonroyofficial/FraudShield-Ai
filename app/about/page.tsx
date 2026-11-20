"use client";
import Image from "next/image";
import { Lock, Eye, Scale, Ban, PhoneCall, Flag, ShieldQuestion, Server } from "lucide-react";
import Reveal from "@/components/Reveal";
import { IMG } from "@/lib/images";

const levels = [
  ["High risk", "Strong indicators of malicious activity.", "Do not interact; verify independently.", "bg-clay"],
  ["Suspicious", "Multiple concerning indicators.", "Exercise caution and verify.", "bg-amber"],
  ["Needs verification", "Not enough evidence for a reliable assessment.", "Check through an official source.", "bg-slate"],
  ["No known threat detected", "No significant known indicators were found.", "Continue normal caution. Not a safety guarantee.", "bg-moss"],
];

export default function About() {
  return (
    <div>
      <section className="relative isolate overflow-hidden px-6 pb-24 pt-36 text-center">
        <Image src={IMG.alps(1900)} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-paper/60 via-paper/85 to-paper" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine-2">How it works · Help</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-balance font-display text-5xl font-medium leading-[1.08] tracking-tight sm:text-6xl">Clear about what we do — <span className="italic text-pine-2">and what we don’t.</span></h1>
      </section>

      <section className="mx-auto max-w-5xl px-6">
        <Reveal><h2 className="font-display text-3xl font-medium">Four possible results</h2>
          <p className="mt-2 text-ink-soft">We deliberately avoid a green “Safe” label and invented percentages.</p></Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {levels.map(([n, m, g, c], i) => (
            <Reveal key={n} delay={i * 0.07}><div className="hairline h-full rounded-3xl bg-white/70 p-6"><span className={`mb-4 block h-1.5 w-12 rounded-full ${c}`} /><h3 className="font-display text-xl font-medium">{n}</h3><p className="mt-1.5 text-ink-soft">{m}</p><p className="mt-3 text-sm font-medium text-ink">{g}</p></div></Reveal>
          ))}
        </div>
      </section>

      <section id="privacy" className="mx-auto mt-24 grid max-w-5xl scroll-mt-28 gap-4 px-6 md:grid-cols-3">
        {[
          [Lock, "Privacy first", "Scans are private by default and never shared with the community automatically. Avoid pasting OTPs, PINs or passwords."],
          [Eye, "Evidence shown", "Every warning points to the words or link features behind it, so you can judge for yourself."],
          [Scale, "Honest limits", "No tool catches everything. New scams may not be known yet, so normal caution always applies."],
        ].map(([I, t, d], i) => {
          const Ic = I as typeof Lock; return <Reveal key={t as string} delay={i * 0.08}><div className="h-full rounded-3xl bg-pine p-7 text-paper"><Ic className="text-sage" /><h3 className="mt-4 font-display text-xl font-medium">{t as string}</h3><p className="mt-2 text-[15px] leading-relaxed text-paper/75">{d as string}</p></div></Reveal>;
        })}
      </section>

      <section className="mx-auto mt-24 max-w-5xl px-6">
        <Reveal><h2 className="flex items-center gap-3 font-display text-3xl font-medium"><Ban className="text-clay" /> What ThreatX does not do</h2></Reveal>
        <Reveal delay={0.08}><ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {["Verify live bKash, Nagad or bank transactions", "Automatically block numbers or accounts", "Accuse a person or seller of a crime", "Monitor your private SMS or WhatsApp", "Replace antivirus or device protection", "Move money on your behalf"].map((x) => <li key={x} className="hairline flex items-center gap-3 rounded-2xl bg-white/60 px-5 py-4 text-ink-soft"><span className="h-1.5 w-1.5 rounded-full bg-clay" />{x}</li>)}
        </ul></Reveal>
      </section>

      <section id="report" className="mx-auto mt-24 max-w-5xl scroll-mt-28 px-6">
        <Reveal>
          <div className="rounded-[2.2rem] bg-sand/50 p-8 sm:p-12">
            <h2 className="flex items-center gap-3 font-display text-3xl font-medium"><Flag className="text-pine-2" /> If you think you’ve been targeted</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {[[PhoneCall, "Stop and secure", "Stop replying. If you shared a PIN or OTP, contact your provider through its official app or website immediately, and change credentials."], [ShieldQuestion, "Verify independently", "Use a number or link you found yourself — never one from the suspicious message."], [Server, "Report", "Report to your provider and local authorities. In an emergency in Bangladesh, call 999. You can also report here for review."]].map(([I, t, d], i) => {
                const Ic = I as typeof Lock; return <div key={i}><Ic className="text-pine" /><h3 className="mt-3 font-semibold">{t as string}</h3><p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{d as string}</p></div>;
              })}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
