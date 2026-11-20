"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

const dict = {
  "nav.scanner": { en: "Scanner", bn: "স্ক্যানার" },
  "nav.community": { en: "Community", bn: "কমিউনিটি" },
  "nav.dashboard": { en: "My Shield", bn: "আমার সুরক্ষা" },
  "nav.about": { en: "How it works", bn: "কীভাবে কাজ করে" },
  "nav.cta": { en: "Check something", bn: "যাচাই করুন" },
  "hero.badge": { en: "Calm, evidence-based fraud protection", bn: "শান্ত, প্রমাণভিত্তিক প্রতারণা সুরক্ষা" },
  "hero.title1": { en: "Stay one step", bn: "প্রতারণার আগেই" },
  "hero.title2": { en: "ahead of scams.", bn: "থাকুন এক ধাপ এগিয়ে।" },
  "hero.sub": { en: "Check suspicious messages, links and screenshots before you take action — in English, বাংলা or Banglish.", bn: "কোনো কিছুতে ক্লিক বা পেমেন্টের আগে সন্দেহজনক মেসেজ, লিংক ও স্ক্রিনশট যাচাই করুন — বাংলা, English বা Banglish-এ।" },
  "hero.cta1": { en: "Start a free check", bn: "বিনামূল্যে যাচাই শুরু করুন" },
  "hero.cta2": { en: "See how it works", bn: "কীভাবে কাজ করে দেখুন" },
  "hero.note": { en: "No account needed · Private by default", bn: "অ্যাকাউন্ট লাগবে না · ডিফল্টভাবে প্রাইভেট" },
  "mode.message": { en: "Message", bn: "মেসেজ" },
  "mode.url": { en: "Link", bn: "লিংক" },
  "mode.image": { en: "Screenshot", bn: "স্ক্রিনশট" },
  "scan.msg.ph": { en: "Paste the SMS, email, WhatsApp or social message here…", bn: "এখানে সন্দেহজনক SMS, ইমেইল, WhatsApp বা সোশ্যাল মেসেজ পেস্ট করুন…" },
  "scan.url.ph": { en: "Paste a web address, e.g. https://example.com/login", bn: "ওয়েব ঠিকানা পেস্ট করুন, যেমন https://example.com/login" },
  "scan.img.drop": { en: "Drop a screenshot here, or browse", bn: "এখানে স্ক্রিনশট ছাড়ুন, অথবা বেছে নিন" },
  "scan.img.hint": { en: "PNG, JPG or WebP · up to 8 MB", bn: "PNG, JPG বা WebP · সর্বোচ্চ ৮ MB" },
  "scan.analyze": { en: "Analyze", bn: "বিশ্লেষণ করুন" },
  "scan.sample": { en: "Try an example", bn: "একটি উদাহরণ দিন" },
  "scan.privacy": { en: "Never include OTPs, PINs or passwords. Your scan stays private.", bn: "OTP, PIN বা পাসওয়ার্ড দেবেন না। আপনার স্ক্যান প্রাইভেট থাকে।" },
  "loading.1": { en: "Reading the content carefully…", bn: "কনটেন্ট মনোযোগ দিয়ে পড়া হচ্ছে…" },
  "loading.2": { en: "Analyzing suspicious indicators…", bn: "সন্দেহজনক সংকেত বিশ্লেষণ করা হচ্ছে…" },
  "loading.3": { en: "Weighing the evidence…", bn: "প্রমাণগুলো মেলানো হচ্ছে…" },
  "loading.4": { en: "Preparing your calm summary…", bn: "আপনার সারসংক্ষেপ তৈরি হচ্ছে…" },
  "risk.high": { en: "High risk", bn: "উচ্চ ঝুঁকি" },
  "risk.suspicious": { en: "Suspicious", bn: "সন্দেহজনক" },
  "risk.verify": { en: "Needs verification", bn: "যাচাই প্রয়োজন" },
  "risk.none": { en: "No known threat detected", bn: "পরিচিত কোনো ঝুঁকি পাওয়া যায়নি" },
  "risk.guide.high": { en: "Do not interact — verify independently.", bn: "যোগাযোগ করবেন না — স্বাধীনভাবে যাচাই করুন।" },
  "risk.guide.suspicious": { en: "Exercise caution and verify.", bn: "সতর্ক থাকুন এবং যাচাই করুন।" },
  "risk.guide.verify": { en: "Check through an official source.", bn: "অফিসিয়াল উৎস থেকে যাচাই করুন।" },
  "risk.guide.none": { en: "Continue normal caution. This is not a safety guarantee.", bn: "স্বাভাবিক সতর্কতা বজায় রাখুন। এটি নিরাপত্তার নিশ্চয়তা নয়।" },
  "res.why": { en: "What we noticed", bn: "যা আমরা লক্ষ্য করেছি" },
  "res.next": { en: "What to do next", bn: "এরপর কী করবেন" },
  "res.limits": { en: "Limits of this assessment", bn: "এই মূল্যায়নের সীমাবদ্ধতা" },
  "res.again": { en: "Check another", bn: "আরেকটি যাচাই করুন" },
  "res.report": { en: "Report to community", bn: "কমিউনিটিতে রিপোর্ট করুন" },
  "res.save": { en: "Saved to My Shield", bn: "আমার সুরক্ষায় সংরক্ষিত" },
  "foot.tag": { en: "Detect. Understand. Prevent. Protect.", bn: "শনাক্ত করুন। বুঝুন। প্রতিরোধ করুন। সুরক্ষিত থাকুন।" },
} as const;

export type DictKey = keyof typeof dict;
interface Ctx { lang: Lang; setLang: (l: Lang) => void; t: (k: DictKey) => string; bi: (b: { en: string; bn: string }) => string }
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => dict[k].en, bi: (b) => b.en });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try { const s = localStorage.getItem("fs.lang"); if (s === "bn" || s === "en") setLangState(s); } catch {}
  }, []);
  const setLang = (l: Lang) => { setLangState(l); try { localStorage.setItem("fs.lang", l); } catch {} document.documentElement.lang = l; };
  return (
    <LangCtx.Provider value={{ lang, setLang, t: (k) => dict[k][lang], bi: (b) => b[lang] }}>
      {children}
    </LangCtx.Provider>
  );
}
export const useLang = () => useContext(LangCtx);
