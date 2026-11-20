"use client";
import { ShieldAlert, ShieldQuestion, ShieldCheck, TriangleAlert } from "lucide-react";
import type { RiskLevel } from "@/types";
import { useLang } from "@/lib/i18n";

export const RISK_STYLE: Record<RiskLevel, { text: string; bg: string; ring: string; solid: string; hex: string; Icon: typeof ShieldAlert }> = {
  high: { text: "text-clay", bg: "bg-clay/10", ring: "ring-clay/25", solid: "bg-clay", hex: "#c0594a", Icon: ShieldAlert },
  suspicious: { text: "text-amber", bg: "bg-amber/10", ring: "ring-amber/30", solid: "bg-amber", hex: "#c68a2a", Icon: TriangleAlert },
  verify: { text: "text-slate", bg: "bg-slate/10", ring: "ring-slate/25", solid: "bg-slate", hex: "#5a7a98", Icon: ShieldQuestion },
  none: { text: "text-moss", bg: "bg-moss/10", ring: "ring-moss/25", solid: "bg-moss", hex: "#5c8b78", Icon: ShieldCheck },
};

export default function RiskBadge({ level, size = "md" }: { level: RiskLevel; size?: "sm" | "md" }) {
  const { t } = useLang();
  const s = RISK_STYLE[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ring-1 ${s.bg} ${s.text} ${s.ring} ${size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"} font-semibold`}>
      <s.Icon size={size === "sm" ? 13 : 16} /> {t(`risk.${level}` as "risk.high")}
    </span>
  );
}
