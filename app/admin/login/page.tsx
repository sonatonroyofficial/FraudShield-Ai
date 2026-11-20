"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";
import { IMG } from "@/lib/images";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (r.ok) { router.replace("/admin"); router.refresh(); return; }
    setErr("Incorrect email or password."); setBusy(false);
  }
  const field = "flex items-center gap-3 rounded-2xl border border-line bg-white/80 px-4 transition focus-within:border-pine-2 focus-within:bg-white focus-within:ring-4 focus-within:ring-sage/25";

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-10">
      <Image src={IMG.mist(2000)} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pine/85 via-pine/70 to-ink/80" />
      <span className="absolute -left-20 top-10 -z-10 h-96 w-96 animate-drift rounded-full bg-sage/25 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="glass w-full max-w-md rounded-[2rem] p-8 shadow-lift sm:p-10">
        <Logo />
        <span className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-xs font-semibold uppercase tracking-wider text-pine"><ShieldCheck size={13} /> Admin console</span>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">Welcome back</h1>
        <p className="mt-2 text-ink-soft">Sign in to review reports and monitor the platform.</p>
        <form onSubmit={submit} className="mt-7 space-y-3">
          <label className={field}><Mail size={18} className="text-muted" /><input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className="h-[52px] w-full bg-transparent outline-none" /></label>
          <label className={field}><Lock size={18} className="text-muted" /><input required type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="h-[52px] w-full bg-transparent outline-none" />
            <button type="button" onClick={() => setShow(!show)} aria-label="Toggle password" className="text-muted hover:text-ink">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></label>
          {err && <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: [0, -6, 6, -4, 0] }} className="rounded-xl bg-clay/10 px-4 py-2.5 text-sm text-clay" role="alert">{err}</motion.p>}
          <button disabled={busy} className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-pine px-6 py-3.5 font-semibold text-paper transition hover:bg-pine-2 disabled:opacity-70">
            {busy ? <><Loader2 size={17} className="animate-spin" /> Signing in…</> : <>Sign in <ArrowRight size={16} className="transition group-hover:translate-x-1" /></>}
          </button>
        </form>
        <Link href="/" className="mt-6 inline-block text-sm text-muted underline-offset-4 hover:underline">← Back to ThreatX</Link>
      </motion.div>
    </div>
  );
}
