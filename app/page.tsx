"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, MessageSquareText, Link2, ImageUp, Languages, Eye, UsersRound, Sparkles, Plus,
  Layers, Radar, Brain, ScanSearch, Scale, Leaf, Lock, Building2, ShieldCheck, Gavel } from "lucide-react";
import ScanBox from "@/components/ScanBox";
import Reveal from "@/components/Reveal";
import HeroDemo from "@/components/HeroDemo";
import { IMG } from "@/lib/images";
import { useLang } from "@/lib/i18n";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pine-2">{children}</p>;
}

function Hero() {
  const { t } = useLang();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const words1 = t("hero.title1").split(" ");
  const words2 = t("hero.title2").split(" ");
  return (
    <section ref={ref} className="relative isolate overflow-hidden pb-48 pt-32 sm:pt-40">
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-20">
        <Image src={IMG.lake(2200)} alt="Calm misty mountain lake at dawn" fill priority sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-paper/70 via-paper/55 to-paper" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_20%_30%,rgb(246_244_238/.85),transparent)]" />
      <span className="absolute -left-32 top-24 -z-10 h-96 w-96 animate-drift rounded-full bg-sage/40 blur-3xl" />
      <span className="absolute -right-24 bottom-10 -z-10 h-80 w-80 animate-drift rounded-full bg-sand/70 blur-3xl [animation-delay:-8s]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-pine">
            <Leaf size={15} /> {t("hero.badge")}
          </motion.span>
          <h1 className="mt-6 text-balance font-display text-[2.9rem] font-medium leading-[1.04] tracking-tight sm:text-7xl">
            {[...words1.map((w) => ({ w, i: false })), ...words2.map((w) => ({ w, i: true }))].map((o, idx) => (
              <span key={idx} className="inline-block overflow-hidden pb-2 align-bottom">
                <motion.span className={`inline-block pr-[0.25em] ${o.i ? "italic text-pine-2" : ""}`} initial={{ y: "110%", rotate: 4 }} animate={{ y: 0, rotate: 0 }} transition={{ duration: 1, delay: 0.3 + idx * 0.09, ease: [0.22, 1, 0.36, 1] }}>{o.w}</motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9 }} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl">{t("hero.sub")}</motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.9 }} className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/scanner" className="group inline-flex items-center gap-2 rounded-full bg-pine px-7 py-4 text-[15px] font-semibold text-paper shadow-lift transition hover:bg-pine-2">
              {t("hero.cta1")} <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </Link>
            <a href="#how" className="inline-flex items-center gap-2 rounded-full px-6 py-4 text-[15px] font-semibold text-pine transition hover:bg-white/60">{t("hero.cta2")}</a>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="mt-5 flex items-center gap-2 text-sm text-muted"><Lock size={14} /> {t("hero.note")}</motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 40, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.7, duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className="flex justify-center lg:justify-end">
          <div className="animate-float"><HeroDemo /></div>
        </motion.div>
      </div>
    </section>
  );
}

function QuickScan() {
  return (
    <section className="relative z-10 mx-auto -mt-36 max-w-3xl px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
        <ScanBox compact />
      </motion.div>
    </section>
  );
}

function TrustStrip() {
  const items = ["Smart analysis", "Evidence-based warnings", "Community alerts", "Bangla · English · Banglish", "Private by default", "Never a false “safe”"];
  return (
    <div className="mt-20 overflow-hidden border-y border-line py-5" aria-hidden>
      <div className="flex w-max animate-marquee gap-12">
        {[...items, ...items, ...items, ...items].map((s, i) => (
          <span key={i} className="flex items-center gap-12 whitespace-nowrap font-display text-xl italic text-ink-soft">{s}<Leaf size={14} className="text-sage" /></span>
        ))}
      </div>
    </div>
  );
}

function Modes() {
  const modes = [
    { Icon: MessageSquareText, t: "Messages", d: "Paste any SMS, email, WhatsApp or social message. We highlight the exact phrases that raised a flag.", img: IMG.phone(900), span: "md:col-span-2 md:row-span-2", big: true },
    { Icon: Link2, t: "Links", d: "Look-alike domains, hidden shorteners and risky login pages — explained in plain words.", img: IMG.mist(800), span: "" },
    { Icon: ImageUp, t: "Screenshots", d: "Upload a screenshot. We read the text and run the same careful analysis.", img: IMG.leaves(800), span: "" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 pt-28">
      <Reveal className="max-w-2xl"><Eyebrow>Three ways to check</Eyebrow>
        <h2 className="mt-3 text-balance font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">Whatever it is, bring it here <span className="italic text-pine-2">before you act.</span></h2></Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-3 md:grid-rows-2">
        {modes.map((m, i) => (
          <Reveal key={m.t} delay={i * 0.1} className={m.span}>
            <Link href="/scanner" className="group relative flex h-full min-h-[270px] flex-col justify-end overflow-hidden rounded-[2rem] shadow-soft">
              <Image src={m.img} alt="" fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover transition duration-[1400ms] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-pine via-pine/60 to-pine/10 transition group-hover:from-pine/95" />
              <div className="relative p-7 text-paper">
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur-md"><m.Icon size={22} /></span>
                <h3 className={`font-display font-medium ${m.big ? "text-4xl" : "text-2xl"}`}>{m.t}</h3>
                <p className={`mt-2 max-w-md leading-relaxed text-paper/80 ${m.big ? "text-lg" : "text-[15px]"}`}>{m.d}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">Check now <ArrowUpRight size={16} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function How() {
  const steps = [
    { Icon: ScanSearch, t: "Read & prepare", d: "Language detection, OCR for screenshots, and extraction of links and phone numbers." },
    { Icon: Layers, t: "Rules engine", d: "Known scam phrases, OTP requests, advance-fee demands and brand impersonation." },
    { Icon: Radar, t: "Threat intelligence", d: "Known-bad indicators from permitted sources, plus look-alike domain checks." },
    { Icon: Brain, t: "Contextual AI", d: "Understands intent and tone — Bangla, English and Banglish — and explains the tactic." },
    { Icon: Scale, t: "Evidence engine", d: "Weighs everything, resolves conflicts and states its limits. Never one opinion alone." },
  ];
  return (
    <section id="how" className="relative mt-28 scroll-mt-24 overflow-hidden bg-pine py-28 text-paper">
      <Image src={IMG.alps(1900)} alt="" fill sizes="100vw" className="object-cover opacity-[0.14] mix-blend-luminosity" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-sage">How it works</p>
          <h2 className="mt-3 text-balance font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">Five independent layers. <span className="italic text-sage">One calm answer.</span></h2>
          <p className="mt-5 text-lg text-paper/70">FraudShield is not a chatbot guessing “scam or not”. It combines separate sources of evidence, so no single weak signal decides the outcome.</p></Reveal>
        <div className="relative mt-16 grid gap-5 md:grid-cols-5">
          <motion.span aria-hidden initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: "easeInOut" }} className="absolute left-[10%] right-[10%] top-7 hidden h-px origin-left bg-gradient-to-r from-sage/0 via-sage/70 to-sage/0 md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.12}>
              <div className="relative">
                <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl bg-paper text-pine shadow-lift"><s.Icon size={24} /></span>
                <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-sage">0{i + 1}</p>
                <h3 className="mt-1 font-display text-xl font-medium">{s.t}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-paper/65">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Evidence() {
  const rows = [
    { t: "Urgency and fear tactics", d: "The message threatens account suspension to pressure the recipient into acting quickly.", c: "text-clay bg-clay/10" },
    { t: "Unverified link", d: "The destination domain needs independent verification.", c: "text-amber bg-amber/10" },
    { t: "Credential-harvesting risk", d: "The message may be attempting to obtain account credentials or OTPs.", c: "text-clay bg-clay/10" },
  ];
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pt-32 lg:grid-cols-2">
      <Reveal>
        <Eyebrow>Evidence before conclusions</Eyebrow>
        <h2 className="mt-3 text-balance font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">We show <span className="italic text-pine-2">why</span> — not just a verdict.</h2>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">Every result lists the exact words or link features behind it, what they usually mean, and one clear next step. You stay in control of the decision.</p>
        <ul className="mt-8 space-y-4">
          {[[Eye, "Highlights the phrases that triggered a warning"], [Scale, "States what we could not verify"], [Sparkles, "Gives a clear next action for every result"]].map(([Ic, tx], i) => {
            const I = Ic as typeof Eye; return <li key={i} className="flex items-center gap-3 text-ink"><span className="grid h-9 w-9 place-items-center rounded-xl bg-mist text-pine"><I size={18} /></span>{tx as string}</li>;
          })}
        </ul>
      </Reveal>
      <Reveal delay={0.15}>
        <div className="glass rounded-[2rem] p-5 shadow-lift sm:p-7">
          <p className="rounded-2xl bg-white/80 p-5 text-[15px] leading-8">Dear Customer, Your mobile banking account <mark className="hl">will be suspended today</mark>. <mark className="hl">Verify your account immediately</mark> using the link below to avoid permanent suspension.</p>
          <div className="mt-4 space-y-2.5">
            {rows.map((r, i) => (
              <motion.div key={r.t} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.15, duration: 0.7 }} className="hairline rounded-2xl bg-white/80 p-4">
                <p className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.c}`}>{r.t}</p>
                <p className="mt-1.5 text-sm text-ink-soft">{r.d}</p>
              </motion.div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted">Illustrative demonstration — not a live threat lookup.</p>
        </div>
      </Reveal>
    </section>
  );
}

function Languages_() {
  const ex = [
    { l: "English", s: "Your account will be blocked. Verify now.", f: "font-sans" },
    { l: "বাংলা", s: "আপনার অ্যাকাউন্ট বন্ধ হয়ে যাবে। এখনই যাচাই করুন।", f: "font-sans" },
    { l: "Banglish", s: "Apnar account bondho hoye jabe, ekhoni verify korun.", f: "font-sans" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 pt-32">
      <Reveal className="mx-auto max-w-2xl text-center"><Eyebrow>Made for how people really write</Eyebrow>
        <h2 className="mt-3 text-balance font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">বাংলা, English <span className="italic text-pine-2">and Banglish.</span></h2>
        <p className="mt-5 text-lg text-ink-soft">Banglish is not just English. FraudShield is built to understand mixed scripts and romanised Bangla.</p></Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {ex.map((e, i) => (
          <Reveal key={e.l} delay={i * 0.1}>
            <motion.div whileHover={{ y: -6, rotate: i === 1 ? 0 : i === 0 ? -0.6 : 0.6 }} className="hairline h-full rounded-[1.8rem] bg-white/70 p-7 transition-shadow hover:shadow-lift">
              <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-pine"><Languages size={13} /> {e.l}</span>
              <p className={`mt-5 font-display text-2xl leading-snug`}>“{e.s}”</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Promise_() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-32">
      <Reveal>
        <div className="relative isolate grid overflow-hidden rounded-[2.4rem] bg-pine text-paper shadow-lift lg:grid-cols-[1.1fr_1fr]">
          <div className="p-9 sm:p-14">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-sage"><Gavel size={15} /> Our promise</p>
            <h2 className="mt-4 text-balance font-display text-3xl font-medium leading-tight sm:text-5xl">“No known threat” is <span className="italic text-sage">never</span> “safe”.</h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-paper/75">New scams appear before any database knows them. So FraudShield never shows a green “Safe” stamp or an invented “97% scam” number. We show what we found, what we could not verify, and what a careful person would do next.</p>
            <ul className="mt-8 grid gap-3 text-[15px] sm:grid-cols-2">
              {["Uncertainty is stated, not hidden", "Your scans stay private", "Reports are reviewed by people", "A report is an allegation, not proof"].map((x) => <li key={x} className="flex items-center gap-2.5"><ShieldCheck size={17} className="shrink-0 text-sage" />{x}</li>)}
            </ul>
          </div>
          <div className="relative min-h-[300px]">
            <Image src={IMG.forest(1200)} alt="Sunlight through a quiet forest" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-pine via-pine/20 to-transparent max-lg:bg-gradient-to-b" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Community() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-32 lg:grid-cols-2">
      <Reveal className="relative order-2 lg:order-1">
        <div className="relative aspect-[5/4] overflow-hidden rounded-[2.2rem] shadow-lift">
          <Image src={IMG.team(1400)} alt="A small team collaborating in a bright office" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
        </div>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="glass absolute -bottom-6 -right-2 max-w-[17rem] rounded-2xl p-4 shadow-lift sm:-right-8">
          <p className="flex items-center gap-2 text-sm font-semibold"><UsersRound size={16} className="text-pine-2" /> Reviewed by people</p>
          <p className="mt-1 text-[13px] leading-snug text-ink-soft">Reports stay private until a moderator reviews them. Confidence is shown, never accusations.</p>
        </motion.div>
      </Reveal>
      <Reveal delay={0.1} className="order-1 lg:order-2">
        <Eyebrow>Community intelligence</Eyebrow>
        <h2 className="mt-3 text-balance font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">Safer together, <span className="italic text-pine-2">carefully.</span></h2>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">Voluntarily report scams you receive. Duplicates are merged, patterns surface as campaigns, and only reviewed intelligence becomes a shared warning.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/community" className="inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3.5 text-sm font-semibold text-paper transition hover:bg-pine-2">Explore community alerts <ArrowRight size={16} /></Link>
          <Link href="/community#report" className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-6 py-3.5 text-sm font-semibold transition hover:border-pine-2">Report something</Link>
        </div>
        <div className="mt-10 flex items-center gap-4 rounded-2xl bg-sand/50 p-4">
          <Building2 className="shrink-0 text-pine" />
          <p className="text-sm leading-relaxed text-ink-soft"><span className="font-semibold text-ink">Small business?</span> Business dashboards, team accounts and an API are on the roadmap.</p>
        </div>
      </Reveal>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const qa = [
    ["Is my message shared with anyone?", "No. Scans are private by default. Only reports you deliberately submit enter the community review queue — and they are reviewed by a person first."],
    ["Can FraudShield confirm a bKash or Nagad transaction?", "No. Verifying a real transaction needs official integration. FraudShield only analyses the text or screenshot you submit and explains suspicious patterns."],
    ["What if the result says “No known threat detected”?", "That means we found no significant known indicators. It is not a guarantee. Newly created scams may not be known yet, so keep your normal caution."],
    ["Do I need an account?", "No. You can scan right away. Accounts will only be needed later for saved history and community features."],
  ];
  return (
    <section className="mx-auto max-w-3xl px-6 pt-32">
      <Reveal className="text-center"><Eyebrow>Good to know</Eyebrow><h2 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">Honest answers</h2></Reveal>
      <div className="mt-10 divide-y divide-line rounded-[1.8rem] border border-line bg-white/60">
        {qa.map(([q, a], i) => (
          <div key={q}>
            <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium text-ink">
              {q}<motion.span animate={{ rotate: open === i ? 45 : 0 }} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist text-pine"><Plus size={16} /></motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden"><p className="px-6 pb-6 leading-relaxed text-ink-soft">{a}</p></motion.div>}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-32">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2.6rem] px-6 py-20 text-center shadow-lift sm:py-28">
          <Image src={IMG.mist(2000)} alt="" fill sizes="100vw" className="-z-20 object-cover" />
          <div className="absolute inset-0 -z-10 bg-pine/70" />
          <h2 className="mx-auto max-w-2xl text-balance font-display text-4xl font-medium leading-tight text-paper sm:text-6xl">Got a message that <span className="italic text-sage">feels off?</span></h2>
          <p className="mx-auto mt-5 max-w-lg text-lg text-paper/80">Pause. Breathe. Let us look at it with you.</p>
          <Link href="/scanner" className="group mt-9 inline-flex items-center gap-2 rounded-full bg-paper px-8 py-4 text-[15px] font-semibold text-pine shadow-lift transition hover:scale-[1.03]">Check it now <ArrowRight size={17} className="transition group-hover:translate-x-1" /></Link>
        </div>
      </Reveal>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <QuickScan />
      <TrustStrip />
      <Modes />
      <How />
      <Evidence />
      <Languages_ />
      <Promise_ />
      <Community />
      <Faq />
      <Cta />
    </>
  );
}
