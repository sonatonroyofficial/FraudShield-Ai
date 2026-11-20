"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";
import { IMG } from "@/lib/images";

export default function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [sent, setSent] = useState(false);
  const field = "flex items-center gap-3 rounded-2xl border border-line bg-white/80 px-4 transition focus-within:border-pine-2 focus-within:ring-4 focus-within:ring-sage/25";
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 pb-12 pt-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <Logo />
          <h1 className="mt-8 font-display text-4xl font-medium tracking-tight">{mode === "in" ? "Welcome back" : "Create your space"}</h1>
          <p className="mt-2 text-ink-soft">Optional — you can always scan without an account.</p>
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-8 space-y-3">
            {mode === "up" && <label className={field}><User size={18} className="text-muted" /><input required placeholder="Name" className="h-13 h-[52px] w-full bg-transparent outline-none" /></label>}
            <label className={field}><Mail size={18} className="text-muted" /><input required type="email" placeholder="Email" className="h-[52px] w-full bg-transparent outline-none" /></label>
            <label className={field}><Lock size={18} className="text-muted" /><input required type="password" minLength={8} placeholder="Password" className="h-[52px] w-full bg-transparent outline-none" /></label>
            <button className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-pine px-6 py-3.5 font-semibold text-paper transition hover:bg-pine-2">{mode === "in" ? "Sign in" : "Create account"} <ArrowRight size={16} className="transition group-hover:translate-x-1" /></button>
          </form>
          {sent && <p className="mt-4 rounded-2xl bg-mist p-4 text-sm text-pine">Accounts are not connected in this preview. Secure sign-in (email verification, Argon2id-hashed passwords, HTTP-only sessions) arrives with the backend.</p>}
          <p className="mt-6 text-sm text-ink-soft">{mode === "in" ? "New here?" : "Already have an account?"} <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setSent(false); }} className="font-semibold text-pine underline-offset-4 hover:underline">{mode === "in" ? "Create an account" : "Sign in"}</button></p>
          <Link href="/scanner" className="mt-3 inline-block text-sm text-muted underline-offset-4 hover:underline">Continue without an account</Link>
        </motion.div>
      </div>
      <div className="relative hidden lg:block">
        <Image src={IMG.forest(1400)} alt="Quiet forest in soft light" fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-pine/80 via-pine/20 to-transparent" />
        <p className="absolute bottom-14 left-12 right-12 font-display text-4xl leading-tight text-paper">Safety should feel <span className="italic text-sage">quiet.</span></p>
      </div>
    </div>
  );
}
