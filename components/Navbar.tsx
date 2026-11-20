"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ScanSearch, Languages } from "lucide-react";
import Logo from "./Logo";
import { useLang } from "@/lib/i18n";

export default function Navbar() {
  const path = usePathname();
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  if (path.startsWith("/admin") || path.startsWith("/docs")) return null;
  const links = [
    { href: "/scanner", label: t("nav.scanner") },
    { href: "/community", label: t("nav.community") },
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/about", label: t("nav.about") },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <motion.nav initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full py-2.5 pl-5 pr-2.5 shadow-soft">
        <Link href="/" aria-label="ThreatX AI home"><Logo /></Link>
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = path.startsWith(l.href);
            return (
              <li key={l.href} className="relative">
                <Link href={l.href} className={`relative z-10 block rounded-full px-4 py-2 text-sm font-medium transition-colors ${active ? "text-pine" : "text-ink-soft hover:text-ink"}`}>{l.label}</Link>
                {active && <motion.span layoutId="navpill" className="absolute inset-0 rounded-full bg-mist" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === "en" ? "bn" : "en")} aria-label="Switch language"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-mist sm:flex">
            <Languages size={16} /> {lang === "en" ? "বাংলা" : "English"}
          </button>
          <Link href="/scanner" className="group hidden items-center gap-2 rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-paper shadow-soft transition hover:bg-pine-2 sm:inline-flex">
            <ScanSearch size={16} className="transition group-hover:rotate-12" /> {t("nav.cta")}
          </Link>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-mist md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.97 }}
            className="glass mx-auto mt-2 max-w-6xl rounded-3xl p-3 shadow-lift md:hidden">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-base font-medium text-ink hover:bg-mist">{l.label}</Link>
            ))}
            <div className="mt-2 flex gap-2">
              <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="flex-1 rounded-2xl bg-mist px-4 py-3 text-sm font-medium">{lang === "en" ? "বাংলা" : "English"}</button>
              <Link href="/scanner" onClick={() => setOpen(false)} className="flex-1 rounded-2xl bg-pine px-4 py-3 text-center text-sm font-medium text-paper">{t("nav.cta")}</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
