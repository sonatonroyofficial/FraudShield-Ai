"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Download, Link2, Printer, FileText, Menu, X, Pencil, ArrowUpRight, Eye } from "lucide-react";
import Logo from "@/components/Logo";
import TeamGrid from "./TeamGrid";
import { FeatureMatrix, LivePill, LiveProvider, LiveStats } from "./Live";
import type { DocSection, DocsContent } from "@/lib/docsTypes";

const Mermaid = dynamic(() => import("./Mermaid"), { ssr: false, loading: () => <div className="h-48 rounded-3xl border border-line bg-white" /> });

const textOf = (html = "") => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;|&amp;/g, " ").replace(/\s+/g, " ").trim();

function toMarkdown(c: DocsContent): string {
  const md = (h = "") => h
    .replace(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/gi, "\n### $1\n").replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n").replace(/<\/?(ul|ol|thead|tbody)>/gi, "\n")
    .replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, (_, r) => "| " + r.replace(/<\/t[hd]>/gi, " | ").replace(/<[^>]+>/g, "").trim() + "\n")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)").replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**").replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "_$2_")
    .replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`").replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, "> $1\n").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  const out = [`# ${c.title}`, `_${c.tagline}_`, ""];
  c.sections.forEach((s, i) => {
    out.push(`## ${i + 1}. ${s.title}`, "");
    if (s.html) out.push(md(s.html), "");
    if (s.type === "mermaid" && s.mermaid) out.push("```mermaid", s.mermaid, "```", "");
    if (s.type === "team") c.team.members.forEach((m) => out.push(`- **${m.name}** — ${m.role}${m.email ? ` (${m.email})` : ""}`));
    if (s.type === "changelog") c.changelog.forEach((e) => out.push(`### ${e.version} — ${e.date}`, ...e.notes.map((n) => `- ${n}`), ""));
    out.push("");
  });
  return out.join("\n");
}

function SectionBody({ s, c }: { s: DocSection; c: DocsContent }) {
  return (
    <div className="space-y-6">
      {s.html && <div className="prose-docs" dangerouslySetInnerHTML={{ __html: s.html }} />}
      {s.type === "features" && <FeatureMatrix />}
      {s.type === "live" && <LiveStats />}
      {s.type === "mermaid" && s.mermaid && <figure><Mermaid code={s.mermaid} />{s.caption && <figcaption className="mt-3 text-center text-sm text-muted">{s.caption}</figcaption>}</figure>}
      {s.type === "team" && <TeamGrid name={c.team.name} members={c.team.members} />}
      {s.type === "changelog" && (
        <ol className="relative space-y-6 border-l border-line pl-6">
          {c.changelog.map((e) => (
            <li key={e.version} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-paper bg-pine-2" />
              <p className="font-display text-xl text-ink">v{e.version} <span className="ml-2 font-sans text-sm text-muted">{e.date}</span></p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">{e.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function DocsView({ content, preview, isAdmin, publishedAt, accessNote }: { content: DocsContent; preview: boolean; isAdmin: boolean; publishedAt: string | null; accessNote?: string }) {
  const [active, setActive] = useState(content.sections[0]?.id);
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [exp, setExp] = useState(false);
  const [copied, setCopied] = useState(false);

  const pitch = content.sections.filter((s) => s.group === "pitch");
  const tech = content.sections.filter((s) => s.group === "tech");
  const numbered = useMemo(() => new Map(content.sections.map((s, i) => [s.id, i + 1])), [content.sections]);

  useEffect(() => {
    const obs = new IntersectionObserver((es) => { const v = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (v) setActive(v.target.id); }, { rootMargin: "-20% 0px -65% 0px" });
    content.sections.forEach((s) => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [content.sections]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); } if (e.key === "Escape") { setSearchOpen(false); setExp(false); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase(); if (t.length < 2) return [];
    return content.sections.flatMap((s) => {
      const body = textOf(s.html) + " " + (s.mermaid ?? "") + " " + (s.type === "team" ? content.team.members.map((m) => m.name + " " + m.role).join(" ") : "") + (s.type === "changelog" ? content.changelog.map((e) => e.notes.join(" ")).join(" ") : "");
      const hay = (s.title + " " + body).toLowerCase(); const i = hay.indexOf(t);
      return i < 0 ? [] : [{ s, snippet: s.title.toLowerCase().includes(t) ? textOf(s.html).slice(0, 110) : "…" + body.slice(Math.max(0, i - s.title.length - 1 - 40), i - s.title.length - 1 + 90) + "…" }];
    }).slice(0, 8);
  }, [q, content]);

  const go = (id: string) => { setSearchOpen(false); setMenu(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); history.replaceState(null, "", "#" + id); };
  const download = () => { const b = new Blob([toMarkdown(content)], { type: "text/markdown" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "threatx-ai-docs.md"; a.click(); setExp(false); };
  const share = async () => { try { await navigator.clipboard.writeText(location.origin + "/docs" + (active ? "#" + active : "")); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} setExp(false); };

  const Toc = (
    <nav aria-label="Sections" className="space-y-6">
      {[["Pitch deck", pitch], ["Technical docs", tech]].map(([label, list]) => (
        <div key={label as string}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{label as string}</p>
          <ul>{(list as DocSection[]).map((s) => (
            <li key={s.id}><button onClick={() => go(s.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${active === s.id ? "bg-mist font-semibold text-pine" : "text-ink-soft hover:bg-white hover:text-ink"}`}>
              <span className="w-5 text-xs tabular-nums text-muted">{String(numbered.get(s.id)).padStart(2, "0")}</span>{s.title}</button></li>))}</ul>
        </div>
      ))}
    </nav>
  );

  return (
    <LiveProvider>
      <div className="docs-shell min-h-screen bg-paper">
        <header className="no-print fixed inset-x-0 top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[88rem] items-center gap-3 px-4 sm:px-6">
            <button onClick={() => setMenu(true)} aria-label="Sections" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft lg:hidden"><Menu size={18} /></button>
            <Link href="/" className="flex items-center gap-3"><Logo /><span className="hidden rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-pine sm:inline">Docs</span></Link>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden md:block"><LivePill /></span>
              <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-muted transition hover:border-pine-2"><Search size={15} /> <span className="hidden sm:inline">Search</span><kbd className="hidden rounded bg-paper-2 px-1.5 text-[11px] sm:inline">Ctrl K</kbd></button>
              <div className="relative">
                <button onClick={() => setExp(!exp)} className="flex items-center gap-2 rounded-full bg-pine px-4 py-2 text-sm font-medium text-paper transition hover:bg-pine-2"><Download size={15} /> Export</button>
                <AnimatePresence>{exp && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-lift">
                    <button onClick={() => { setExp(false); setTimeout(() => window.print(), 100); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-mist"><Printer size={16} /> PDF (print to PDF)</button>
                    <button onClick={download} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-mist"><FileText size={16} /> Markdown (.md)</button>
                    <button onClick={share} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-mist"><Link2 size={16} /> Copy shareable link</button>
                  </motion.div>)}</AnimatePresence>
              </div>
              {isAdmin && <Link href="/admin/docs" className="hidden items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium transition hover:border-pine-2 sm:flex"><Pencil size={14} /> Edit</Link>}
            </div>
          </div>
        </header>
        <AnimatePresence>{copied && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2 text-sm text-paper shadow-lift">Link copied</motion.div>}</AnimatePresence>

        {preview && (
          <div className="no-print fixed inset-x-0 top-16 z-30 flex items-center justify-center gap-2 bg-amber px-4 py-2 text-center text-sm font-medium text-white"><Eye size={15} /> Admin preview — this page is not public right now. {accessNote}</div>
        )}

        <div className={`mx-auto flex max-w-[88rem] gap-10 px-4 pb-24 sm:px-6 ${preview ? "pt-[7.5rem]" : "pt-24"}`}>
          <aside className="no-print sticky top-24 hidden h-[calc(100vh-7rem)] w-64 shrink-0 overflow-y-auto pr-2 lg:block">{Toc}</aside>
          <main className="min-w-0 flex-1">
            {/* cover slide */}
            <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="relative overflow-hidden rounded-[2.2rem] bg-pine px-6 py-14 text-paper shadow-lift sm:px-14 sm:py-20">
              <span className="absolute -right-24 -top-24 h-80 w-80 animate-drift rounded-full bg-sage/25 blur-3xl" />
              <p className="relative text-sm font-semibold uppercase tracking-[0.22em] text-sage">Pitch deck · Technical documentation</p>
              <h1 className="relative mt-4 font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-7xl">{content.title}</h1>
              <p className="relative mt-4 font-display text-2xl italic text-sage sm:text-3xl">{content.tagline}</p>
              <div className="relative mt-8 flex flex-wrap items-center gap-3">
                <button onClick={() => go(pitch[0]?.id ?? content.sections[0].id)} className="inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3 text-sm font-semibold text-pine transition hover:scale-[1.03]">Start the 2-minute tour</button>
                <Link href="/scanner" className="inline-flex items-center gap-2 rounded-full border border-paper/30 px-6 py-3 text-sm font-semibold transition hover:bg-white/10">Try the live app <ArrowUpRight size={15} /></Link>
              </div>
              {publishedAt && <p className="relative mt-8 text-xs text-paper/60">Last published {new Date(publishedAt).toLocaleString()}</p>}
            </motion.section>

            {content.sections.map((s) => {
              const isPitch = s.group === "pitch";
              return (
                <motion.section key={s.id} id={s.id} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className={`docs-section scroll-mt-28 ${isPitch ? "mt-10 rounded-[2rem] border border-line bg-white/70 p-6 shadow-soft sm:p-12" : "mt-14 px-1 sm:px-4"}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pine-2">{String(numbered.get(s.id)).padStart(2, "0")} · {isPitch ? "Pitch" : "Technical"}</p>
                  <h2 className={`mt-2 font-display font-medium tracking-tight text-ink ${isPitch ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"}`}>{s.title}</h2>
                  <div className="mt-6"><SectionBody s={s} c={content} /></div>
                </motion.section>
              );
            })}
            <p className="mt-16 text-center text-sm text-muted">© {new Date().getFullYear()} {content.title}</p>
          </main>
        </div>

        <AnimatePresence>{menu && (<>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} className="no-print fixed inset-0 z-50 bg-ink/40 lg:hidden" />
          <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: "spring", stiffness: 300, damping: 34 }} className="no-print fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-paper p-5 lg:hidden">
            <button onClick={() => setMenu(false)} aria-label="Close" className="mb-4 grid h-9 w-9 place-items-center rounded-full bg-mist"><X size={16} /></button>{Toc}</motion.aside></>)}</AnimatePresence>

        <AnimatePresence>{searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="no-print fixed inset-0 z-[60] grid place-items-start bg-ink/40 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
            <motion.div initial={{ y: -16, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: -10, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-lift">
              <div className="flex items-center gap-3 border-b border-line px-5"><Search size={18} className="text-muted" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the documentation…" className="h-14 w-full bg-transparent outline-none" /></div>
              <ul className="max-h-[50vh] overflow-y-auto p-2">
                {results.map(({ s, snippet }) => <li key={s.id}><button onClick={() => go(s.id)} className="w-full rounded-2xl px-4 py-3 text-left hover:bg-mist"><p className="text-sm font-semibold">{s.title}</p><p className="mt-0.5 line-clamp-2 text-xs text-muted">{snippet}</p></button></li>)}
                {q.trim().length >= 2 && results.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">No results.</li>}
                {q.trim().length < 2 && content.sections.slice(0, 6).map((s) => <li key={s.id}><button onClick={() => go(s.id)} className="w-full rounded-2xl px-4 py-2.5 text-left text-sm hover:bg-mist">{s.title}</button></li>)}
              </ul>
            </motion.div>
          </motion.div>)}</AnimatePresence>
      </div>
    </LiveProvider>
  );
}
