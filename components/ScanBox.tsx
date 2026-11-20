"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareText, Link2, ImageUp, ArrowRight, Sparkles, Lock, X, FileImage } from "lucide-react";
import { submitScan } from "@/services/api";
import { useLang } from "@/lib/i18n";
import LoadingState from "./LoadingState";
import type { InputType } from "@/types";

const SAMPLES: Record<"message" | "url", string[]> = {
  message: [
    "Dear Customer, Your mobile banking account will be suspended today. Verify immediately using the link below to avoid permanent suspension. http://bkash-secure-verify.xyz/login",
    "আপনার অ্যাকাউন্ট বন্ধ হয়ে যাবে। এখনই যাচাই করুন এবং আপনার OTP শেয়ার করুন।",
    "Apnar account bondho hoye jabe, ekhoni verify korun. Registration fee 500 taka pathan.",
  ],
  url: ["http://bkash-secure-verify.xyz/login", "https://bit.ly/3xYzAbc"],
};

export default function ScanBox({ compact = false, initial = "message" }: { compact?: boolean; initial?: InputType }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [mode, setMode] = useState<InputType>(initial);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState("");
  const sampleIdx = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: "message" as const, label: t("mode.message"), Icon: MessageSquareText },
    { id: "url" as const, label: t("mode.url"), Icon: Link2 },
    { id: "image" as const, label: t("mode.image"), Icon: ImageUp },
  ];

  const pickFile = (f?: File | null) => {
    setErr("");
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return setErr(lang === "bn" ? "শুধু PNG, JPG বা WebP ছবি দিন।" : "Please choose a PNG, JPG or WebP image.");
    if (f.size > 8 * 1024 * 1024) return setErr(lang === "bn" ? "ছবি ৮ MB-এর বেশি হতে পারবে না।" : "Image must be 8 MB or smaller.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const ready = mode === "message" ? text.trim().length > 3 : mode === "url" ? url.trim().length > 3 : !!file;

  async function run() {
    if (!ready || busy) return;
    setBusy(true);
    const res = await submitScan(mode === "message" ? text : mode === "url" ? url : file!.name, mode);
    router.push(`/result/${res.scan_id}`);
  }

  const sample = () => {
    const list = SAMPLES[mode === "url" ? "url" : "message"];
    const s = list[sampleIdx.current++ % list.length];
    if (mode === "url") setUrl(s); else { setMode("message"); setText(s); }
  };

  return (
    <div className={`glass relative overflow-hidden rounded-[2rem] shadow-lift ${compact ? "p-3 sm:p-4" : "p-3 sm:p-5"}`}>
      <AnimatePresence mode="wait">
        {busy ? (
          <motion.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LoadingState /></motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div role="tablist" className="relative inline-flex rounded-full bg-paper-2/80 p-1">
              {tabs.map(({ id, label, Icon }) => (
                <button key={id} role="tab" aria-selected={mode === id} onClick={() => { setMode(id); setErr(""); }}
                  className={`relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${mode === id ? "text-pine" : "text-muted hover:text-ink"}`}>
                  {mode === id && <motion.span layoutId={`tab-${compact}`} className="absolute inset-0 -z-10 rounded-full bg-white shadow-soft" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }}>
                  {mode === "message" && (
                    <textarea value={text} onChange={(e) => setText(e.target.value)} rows={compact ? 4 : 7} maxLength={5000} placeholder={t("scan.msg.ph")} aria-label={t("mode.message")}
                      className="w-full resize-none rounded-2xl border border-line bg-white/80 p-4 text-[15px] leading-relaxed text-ink outline-none transition placeholder:text-muted/80 focus:border-pine-2 focus:bg-white focus:ring-4 focus:ring-sage/25" />
                  )}
                  {mode === "url" && (
                    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white/80 px-4 transition focus-within:border-pine-2 focus-within:bg-white focus-within:ring-4 focus-within:ring-sage/25">
                      <Link2 size={18} className="text-muted" />
                      <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder={t("scan.url.ph")} aria-label={t("mode.url")} inputMode="url"
                        className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/80" />
                    </div>
                  )}
                  {mode === "image" && (
                    <div>
                      {!file ? (
                        <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
                          onDrop={(e) => { e.preventDefault(); setDrag(false); pickFile(e.dataTransfer.files[0]); }}
                          onClick={() => input.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
                          className={`grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed px-6 text-center transition ${compact ? "h-[132px]" : "h-[214px]"} ${drag ? "border-pine-2 bg-mist" : "border-line bg-white/70 hover:border-sage hover:bg-white"}`}>
                          <div>
                            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-pine"><ImageUp size={22} /></motion.div>
                            <p className="font-medium text-ink">{t("scan.img.drop")}</p>
                            <p className="mt-1 text-sm text-muted">{t("scan.img.hint")}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line bg-white p-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preview!} alt="Selected screenshot" className="h-24 w-24 rounded-xl object-cover" />
                          <div className="min-w-0 flex-1"><p className="flex items-center gap-2 truncate font-medium"><FileImage size={16} className="shrink-0 text-pine-2" />{file.name}</p><p className="text-sm text-muted">{(file.size / 1024).toFixed(0)} KB</p></div>
                          <button onClick={() => { setFile(null); setPreview(null); }} aria-label="Remove" className="grid h-9 w-9 place-items-center rounded-full bg-mist transition hover:bg-sand"><X size={16} /></button>
                          <span className="pointer-events-none absolute inset-x-0 h-10 animate-scan bg-gradient-to-b from-transparent via-sage/40 to-transparent" />
                        </div>
                      )}
                      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              {err && <p className="mt-2 text-sm text-clay" role="alert">{err}</p>}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[13px] text-muted"><Lock size={14} className="shrink-0" /> {t("scan.privacy")}</p>
              <div className="flex items-center gap-2">
                {mode !== "image" && (
                  <button onClick={sample} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-pine transition hover:bg-mist"><Sparkles size={15} /> {t("scan.sample")}</button>
                )}
                <button onClick={run} disabled={!ready}
                  className="group inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-paper shadow-soft transition hover:bg-pine-2 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-40">
                  {t("scan.analyze")} <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
