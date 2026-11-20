"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Lock, Eye, HeartHandshake } from "lucide-react";
import Logo from "./Logo";
import { IMG } from "@/lib/images";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLang();
  if (usePathname().startsWith("/admin")) return null;
  return (
    <footer className="relative mt-24 overflow-hidden bg-pine text-paper">
      <Image src={IMG.mist(1800)} alt="" fill sizes="100vw" className="object-cover opacity-[0.16] mix-blend-luminosity" />
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs font-display text-xl leading-snug text-paper/90">{t("foot.tag")}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/60">FraudShield shows its evidence and its limits. “No known threat detected” is never a guarantee of safety.</p>
          </div>
          {[
            { h: "Product", l: [["Scanner", "/scanner"], ["Community", "/community"], ["My Shield", "/dashboard"]] },
            { h: "Learn", l: [["How it works", "/about"], ["Privacy & limits", "/about#privacy"], ["Report fraud", "/about#report"]] },
            { h: "Team", l: [["Moderation", "/admin"], ["Sign in", "/login"]] },
          ].map((c) => (
            <div key={c.h}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{c.h}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.l.map(([n, h]) => <li key={n}><Link href={h} className="text-sm text-paper/75 transition hover:text-paper">{n}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-paper/15 pt-6 text-xs text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FraudShield AI · Prototype for Bangladesh</p>
          <div className="flex gap-5">
            <span className="inline-flex items-center gap-1.5"><Lock size={13} /> Private by default</span>
            <span className="inline-flex items-center gap-1.5"><Eye size={13} /> Evidence shown</span>
            <span className="inline-flex items-center gap-1.5"><HeartHandshake size={13} /> Human-moderated</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
