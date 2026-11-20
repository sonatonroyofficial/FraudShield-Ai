"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, GripVertical, Plus, Trash2, Save, Rocket, History, Users, CalendarClock, Power, FileText, ExternalLink, RotateCcw, Upload, Loader2, CheckCircle2 } from "lucide-react";
import Logo from "@/components/Logo";
import RichEditor from "@/components/docs/RichEditor";
import type { DocSection, DocsAccess, DocsContent, DocsRecord, TeamMember } from "@/lib/docsTypes";

type Rec = DocsRecord & { state: { open: boolean; reason: string } };
type Tab = "access" | "content" | "team" | "versions";

/** ISO ↔ <input type="datetime-local"> in the browser's local time */
const toLocal = (iso: string) => { const d = new Date(iso); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
const fromLocal = (v: string) => new Date(v).toISOString();
const uid = () => Math.random().toString(36).slice(2, 9);

async function resizeSquare(file: File, size = 400): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const c = document.createElement("canvas"); c.width = c.height = size;
  const s = Math.min(img.width, img.height); // centre-crop to 1:1 → every card identical
  c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
  URL.revokeObjectURL(url);
  return c.toDataURL("image/jpeg", 0.82);
}

const REASON: Record<string, string> = { open: "Public — visible to everyone right now", off: "Hidden — visibility switch is OFF", upcoming: "Scheduled — opens later", ended: "Closed — the window has ended" };

export default function AdminDocs() {
  const [rec, setRec] = useState<Rec | null>(null);
  const [draft, setDraft] = useState<DocsContent | null>(null);
  const [access, setAccess] = useState<DocsAccess | null>(null);
  const [tab, setTab] = useState<Tab>("access");
  const [sel, setSel] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [label, setLabel] = useState("");

  const say = (ok: boolean, msg: string) => { setToast({ ok, msg }); setTimeout(() => setToast(null), 3500); };
  const load = async () => { const r = await fetch("/api/admin/docs"); if (!r.ok) return say(false, "Could not load docs settings."); const d: Rec = await r.json(); setRec(d); setDraft(d.draft); setAccess(d.access); setDirty(false); };
  useEffect(() => { load(); }, []);
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, [dirty]);

  async function call(action: string, body: object, ok: string) {
    setBusy(action);
    const r = await fetch("/api/admin/docs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...body }) });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) return say(false, d.error || "Failed");
    setRec(d); if (action !== "access") { setDraft(d.draft); setDirty(false); } else setAccess(d.access);
    say(true, ok);
  }

  const upd = (fn: (d: DocsContent) => DocsContent) => { setDraft((d) => (d ? fn(structuredClone(d)) : d)); setDirty(true); };
  const section = draft?.sections.find((s) => s.id === sel) ?? null;
  const setSection = (patch: Partial<DocSection>) => upd((d) => { const s = d.sections.find((x) => x.id === sel); if (s) Object.assign(s, patch); return d; });
  const preview = useMemo(() => (access ? ((): string => {
    if (!access.visible) return "off"; if (!access.scheduleEnabled) return "open";
    const n = Date.now(); return n < +new Date(access.start) ? "upcoming" : n > +new Date(access.end) ? "ended" : "open"; })() : "off"), [access]);

  if (!rec || !draft || !access) return <div className="grid min-h-screen place-items-center bg-paper text-muted">Loading…</div>;

  const openFor = (hours: number) => { const s = new Date(); const e = new Date(s.getTime() + hours * 3600_000); setAccess({ visible: true, scheduleEnabled: true, start: s.toISOString(), end: e.toISOString() }); };
  const tabs: [Tab, string, typeof Power][] = [["access", "Access & schedule", Power], ["content", "Content", FileText], ["team", "Team", Users], ["versions", "Versions", History]];

  return (
    <div className="min-h-screen bg-paper-2/60">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3 sm:px-8">
          <Link href="/admin" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft" aria-label="Back to admin"><ArrowLeft size={18} /></Link>
          <Logo /><span className="rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-pine">Docs editor</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {dirty && <span className="text-xs font-medium text-amber">Unsaved draft changes</span>}
            <Link href="/docs" target="_blank" className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium hover:border-pine-2"><ExternalLink size={14} /> View /docs</Link>
            <button disabled={!!busy} onClick={() => call("save", { draft }, "Draft saved")} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold hover:border-pine-2 disabled:opacity-60">{busy === "save" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save draft</button>
            <button disabled={!!busy} onClick={() => call("publish", { draft, label: label || "Published" }, "Published to /docs")} className="inline-flex items-center gap-2 rounded-full bg-pine px-5 py-2 text-sm font-semibold text-paper hover:bg-pine-2 disabled:opacity-60">{busy === "publish" ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />} Publish</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-6 flex flex-wrap gap-1 rounded-full bg-white p-1 shadow-soft">
          {tabs.map(([id, l, I]) => (
            <button key={id} onClick={() => setTab(id)} className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${tab === id ? "text-paper" : "text-ink-soft hover:text-ink"}`}>
              {tab === id && <motion.span layoutId="dt" className="absolute inset-0 rounded-full bg-pine" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <I size={15} className="relative" /><span className="relative">{l}</span>
            </button>))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

            {tab === "access" && (
              <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
                  <h2 className="font-display text-2xl font-medium">Visibility</h2>
                  <p className="mt-1 text-sm text-muted">Changes apply instantly when you press “Apply access”. Admins can always preview /docs.</p>
                  <label className="mt-5 flex cursor-pointer items-center justify-between rounded-2xl bg-paper p-4">
                    <span><span className="block font-semibold">Public access</span><span className="text-sm text-muted">ON → anyone can open /docs · OFF → “Not available”</span></span>
                    <button type="button" role="switch" aria-checked={access.visible} onClick={() => setAccess({ ...access, visible: !access.visible })} className={`relative h-8 w-14 rounded-full transition ${access.visible ? "bg-pine" : "bg-line"}`}><motion.span layout className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow ${access.visible ? "right-1" : "left-1"}`} /></button>
                  </label>
                  <label className="mt-3 flex cursor-pointer items-center justify-between rounded-2xl bg-paper p-4">
                    <span><span className="block font-semibold">Use a schedule</span><span className="text-sm text-muted">Only public between start and end (otherwise always on while visible)</span></span>
                    <button type="button" role="switch" aria-checked={access.scheduleEnabled} onClick={() => setAccess({ ...access, scheduleEnabled: !access.scheduleEnabled })} className={`relative h-8 w-14 rounded-full transition ${access.scheduleEnabled ? "bg-pine" : "bg-line"}`}><motion.span layout className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow ${access.scheduleEnabled ? "right-1" : "left-1"}`} /></button>
                  </label>
                  <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${access.scheduleEnabled ? "" : "pointer-events-none opacity-40"}`}>
                    <label className="text-sm font-medium">Start<input type="datetime-local" value={toLocal(access.start)} onChange={(e) => e.target.value && setAccess({ ...access, start: fromLocal(e.target.value) })} className="mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-pine-2" /></label>
                    <label className="text-sm font-medium">End<input type="datetime-local" value={toLocal(access.end)} onChange={(e) => e.target.value && setAccess({ ...access, end: fromLocal(e.target.value) })} className="mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-pine-2" /></label>
                  </div>
                  <p className="mt-2 text-xs text-muted">Times shown in your browser’s time zone ({Intl.DateTimeFormat().resolvedOptions().timeZone}).</p>
                  <div className="mt-5"><p className="mb-2 text-sm font-medium">Quick: open now for…</p>
                    <div className="flex flex-wrap gap-2">{[["24 hours", 24], ["3 days", 72], ["7 days", 168]].map(([l, h]) => <button key={l as string} onClick={() => openFor(h as number)} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-4 py-2 text-sm font-medium text-pine hover:bg-sage/40"><CalendarClock size={14} />{l}</button>)}
                      <button onClick={() => setAccess({ ...access, visible: true, scheduleEnabled: false })} className="rounded-full bg-mist px-4 py-2 text-sm font-medium text-pine hover:bg-sage/40">Always on</button>
                      <button onClick={() => setAccess({ ...access, visible: false })} className="rounded-full bg-clay/10 px-4 py-2 text-sm font-medium text-clay hover:bg-clay/20">Turn off now</button></div></div>
                  <button disabled={busy === "access"} onClick={() => call("access", { access }, "Access settings applied")} className="mt-6 inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-paper hover:bg-pine-2 disabled:opacity-60">{busy === "access" ? <Loader2 size={15} className="animate-spin" /> : <Power size={15} />} Apply access</button>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-line bg-white p-6 shadow-soft"><p className="text-xs font-semibold uppercase tracking-wider text-muted">Status after you apply</p>
                    <p className={`mt-3 flex items-center gap-2 font-display text-2xl ${preview === "open" ? "text-moss" : "text-amber"}`}>{preview === "open" ? <Eye size={22} /> : <EyeOff size={22} />}{REASON[preview]}</p>
                    <p className="mt-3 text-sm text-muted">Currently live: <strong className="text-ink">{REASON[rec.state.reason]}</strong></p></div>
                  <div className="rounded-3xl bg-sand/50 p-6 text-sm leading-relaxed text-ink-soft">Default window is <strong>June 10 00:00 → June 14 23:59</strong> (Bangladesh time) for the next upcoming June. Edit or switch it off at any time.</div>
                </div>
              </div>
            )}

            {tab === "content" && (
              <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                <div className="rounded-3xl border border-line bg-white p-4 shadow-soft">
                  <div className="mb-3 flex items-center justify-between px-1"><h2 className="font-display text-xl font-medium">Sections</h2>
                    <button onClick={() => { const id = "s-" + uid(); upd((d) => { d.sections.push({ id, title: "New section", group: "tech", type: "rich", visible: true, html: "<p>Write here…</p>" }); return d; }); setSel(id); }} className="grid h-9 w-9 place-items-center rounded-full bg-pine text-paper hover:bg-pine-2" aria-label="Add section"><Plus size={16} /></button></div>
                  <p className="mb-2 px-1 text-xs text-muted">Drag to reorder. Click to edit.</p>
                  <Reorder.Group axis="y" values={draft.sections} onReorder={(v) => upd((d) => { d.sections = v; return d; })} className="space-y-1.5">
                    {draft.sections.map((s) => (
                      <Reorder.Item key={s.id} value={s} className={`flex cursor-grab items-center gap-2 rounded-xl border px-2 py-2 text-sm active:cursor-grabbing ${sel === s.id ? "border-pine-2 bg-mist" : "border-line bg-white"} ${s.visible ? "" : "opacity-50"}`}>
                        <GripVertical size={15} className="shrink-0 text-muted" />
                        <button onClick={() => setSel(s.id)} className="min-w-0 flex-1 truncate text-left font-medium">{s.title}</button>
                        <span className="rounded bg-paper-2 px-1.5 text-[10px] uppercase text-muted">{s.group === "pitch" ? "Pitch" : "Tech"}</span>
                        <button onClick={() => upd((d) => { const x = d.sections.find((y) => y.id === s.id)!; x.visible = !x.visible; return d; })} aria-label="Toggle visibility" className="text-muted hover:text-ink">{s.visible ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                      </Reorder.Item>))}
                  </Reorder.Group>
                </div>
                <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
                  {!section ? <p className="py-20 text-center text-muted">Select a section to edit.</p> : (
                    <div key={section.id} className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <input value={section.title} onChange={(e) => setSection({ title: e.target.value })} className="h-12 rounded-xl border border-line px-4 font-display text-xl outline-none focus:border-pine-2" aria-label="Section title" />
                        <select value={section.group} onChange={(e) => setSection({ group: e.target.value as "pitch" | "tech" })} className="h-12 rounded-xl border border-line bg-white px-3 text-sm outline-none"><option value="pitch">Pitch deck</option><option value="tech">Technical docs</option></select>
                      </div>
                      {["features", "live", "team", "changelog", "mermaid"].includes(section.type) && <p className="rounded-xl bg-mist px-4 py-2.5 text-sm text-pine">{section.type === "features" || section.type === "live" ? "This section also shows live system data automatically." : section.type === "team" ? "Members are edited in the Team tab." : section.type === "changelog" ? "Entries are edited below." : "Diagram is edited below."}</p>}
                      {section.type !== "mermaid" && section.type !== "team" && section.type !== "changelog" && <RichEditor key={section.id} value={section.html ?? ""} onChange={(h) => setSection({ html: h })} />}
                      {section.type === "mermaid" && (<>
                        <label className="block text-sm font-medium">Mermaid diagram code<textarea value={section.mermaid ?? ""} onChange={(e) => setSection({ mermaid: e.target.value })} rows={14} spellCheck={false} className="mt-1.5 w-full rounded-xl border border-line bg-paper p-4 font-mono text-[13px] outline-none focus:border-pine-2" /></label>
                        <label className="block text-sm font-medium">Caption<input value={section.caption ?? ""} onChange={(e) => setSection({ caption: e.target.value })} className="mt-1.5 h-11 w-full rounded-xl border border-line px-3 outline-none focus:border-pine-2" /></label></>)}
                      {section.type === "changelog" && (
                        <div className="space-y-3">
                          {draft.changelog.map((e, i) => (
                            <div key={i} className="rounded-2xl border border-line p-4">
                              <div className="flex gap-2"><input value={e.version} onChange={(ev) => upd((d) => { d.changelog[i].version = ev.target.value; return d; })} placeholder="1.0.0" className="h-10 w-28 rounded-lg border border-line px-3 text-sm outline-none" /><input value={e.date} onChange={(ev) => upd((d) => { d.changelog[i].date = ev.target.value; return d; })} placeholder="2026-06-10" className="h-10 w-40 rounded-lg border border-line px-3 text-sm outline-none" /><button onClick={() => upd((d) => { d.changelog.splice(i, 1); return d; })} aria-label="Remove" className="ml-auto text-muted hover:text-clay"><Trash2 size={16} /></button></div>
                              <textarea value={e.notes.join("\n")} onChange={(ev) => upd((d) => { d.changelog[i].notes = ev.target.value.split("\n"); return d; })} rows={3} placeholder="One note per line" className="mt-2 w-full rounded-lg border border-line p-3 text-sm outline-none" /></div>))}
                          <button onClick={() => upd((d) => { d.changelog.unshift({ version: "", date: new Date().toISOString().slice(0, 10), notes: [] }); return d; })} className="inline-flex items-center gap-2 rounded-full bg-mist px-4 py-2 text-sm font-medium text-pine"><Plus size={14} /> Add entry</button></div>)}
                      {!["features", "live", "team", "changelog"].includes(section.type) || section.id.startsWith("s-") ? (
                        <button onClick={() => { if (confirm("Delete this section from the draft?")) { upd((d) => { d.sections = d.sections.filter((x) => x.id !== section.id); return d; }); setSel(null); } }} className="inline-flex items-center gap-2 text-sm text-clay hover:underline"><Trash2 size={14} /> Delete section</button>) : null}
                    </div>)}
                </div>
              </div>
            )}

            {tab === "team" && (
              <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
                <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl font-medium">Team</h2><p className="text-sm text-muted">Photos are automatically cropped to a square and resized to 400×400 so every card looks identical.</p></div>
                  <button onClick={() => upd((d) => { d.team.members.push({ id: uid(), name: "", role: "", email: "" }); return d; })} className="inline-flex items-center gap-2 rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-paper"><Plus size={15} /> Add member</button></div>
                <label className="mt-5 block text-sm font-medium">Team name (optional)<input value={draft.team.name} onChange={(e) => upd((d) => { d.team.name = e.target.value; return d; })} className="mt-1.5 h-12 w-full max-w-md rounded-xl border border-line px-4 outline-none focus:border-pine-2" /></label>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {draft.team.members.map((m, i) => <MemberEditor key={m.id} m={m} onChange={(p) => upd((d) => { Object.assign(d.team.members[i], p); return d; })} onRemove={() => upd((d) => { d.team.members.splice(i, 1); return d; })} onErr={(t) => say(false, t)} />)}
                  {draft.team.members.length === 0 && <p className="col-span-full rounded-2xl bg-sand/50 p-6 text-center text-sm text-ink-soft">No members yet. Add each person’s photo, full name, role and email.</p>}
                </div>
              </div>
            )}

            {tab === "versions" && (
              <div className="rounded-3xl border border-line bg-white p-6 shadow-soft">
                <h2 className="font-display text-2xl font-medium">Version history</h2>
                <p className="text-sm text-muted">Each publish is saved (last 20). Restoring loads that version into your draft — publish again to make it live.</p>
                <label className="mt-4 block text-sm font-medium">Label for the next publish<input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Added team photos" className="mt-1.5 h-11 w-full max-w-md rounded-xl border border-line px-3 outline-none focus:border-pine-2" /></label>
                <ul className="mt-5 divide-y divide-line">
                  {rec.versions.map((v, i) => (
                    <li key={v.id} className="flex flex-wrap items-center gap-3 py-3.5">
                      <div className="min-w-0 flex-1"><p className="font-medium">{v.label} {i === 0 && <span className="ml-2 rounded-full bg-moss/10 px-2 py-0.5 text-xs text-moss">Live</span>}</p><p className="text-xs text-muted">{new Date(v.at).toLocaleString()} · {v.content.sections.length} sections</p></div>
                      <button disabled={!!busy} onClick={() => confirm("Load this version into your draft? Unsaved draft changes will be replaced.") && call("restore", { id: v.id }, "Version loaded into draft")} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-4 py-2 text-sm font-medium text-pine hover:bg-sage/40"><RotateCcw size={14} /> Restore to draft</button>
                    </li>))}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lift ${toast.ok ? "bg-pine" : "bg-clay"}`}>{toast.ok && <CheckCircle2 size={16} />}{toast.msg}</motion.div>}</AnimatePresence>
    </div>
  );
}

function MemberEditor({ m, onChange, onRemove, onErr }: { m: TeamMember; onChange: (p: Partial<TeamMember>) => void; onRemove: () => void; onErr: (t: string) => void }) {
  const file = useRef<HTMLInputElement>(null);
  const pick = async (f?: File) => {
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(f.type)) return onErr("Use a PNG, JPG or WebP photo.");
    try { onChange({ photo: await resizeSquare(f) }); } catch { onErr("Could not read that image."); }
  };
  return (
    <div className="flex gap-4 rounded-2xl border border-line p-4">
      <button type="button" onClick={() => file.current?.click()} className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-mist ring-1 ring-line" aria-label="Upload photo">
        {m.photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.photo} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center bg-gradient-to-br from-pine to-pine-2 font-display text-3xl text-paper">{(m.name[0] ?? "?").toUpperCase()}</span>}
        <span className="absolute inset-0 grid place-items-center bg-ink/50 text-paper opacity-0 transition group-hover:opacity-100"><Upload size={18} /></span>
      </button>
      <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      <div className="min-w-0 flex-1 space-y-2">
        <input value={m.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="Full name" className="h-10 w-full rounded-lg border border-line px-3 text-sm font-medium outline-none focus:border-pine-2" />
        <input value={m.role} onChange={(e) => onChange({ role: e.target.value })} placeholder="Role in the application" className="h-10 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-pine-2" />
        <input value={m.email} type="email" onChange={(e) => onChange({ email: e.target.value })} placeholder="Email address" className="h-10 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-pine-2" />
        <div className="flex gap-3 text-xs">{m.photo && <button onClick={() => onChange({ photo: undefined })} className="text-muted hover:underline">Remove photo</button>}<button onClick={onRemove} className="ml-auto inline-flex items-center gap-1 text-clay hover:underline"><Trash2 size={12} /> Remove member</button></div>
      </div>
    </div>
  );
}
