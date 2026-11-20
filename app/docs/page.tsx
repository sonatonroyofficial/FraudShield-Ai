import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CalendarClock, Lock } from "lucide-react";
import Logo from "@/components/Logo";
import DocsView from "@/components/docs/DocsView";
import { COOKIE, verifyToken } from "@/lib/adminAuth";
import { accessState, loadRecord, publicContent } from "@/lib/server/docsStore";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Docs — ThreatX AI", description: "Pitch deck, technical documentation and live system status for ThreatX AI." };

const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }) + " (BST)";

export default async function DocsPage() {
  const rec = await loadRecord();
  const st = accessState(rec.access);
  const admin = await verifyToken((await cookies()).get(COOKIE)?.value);

  if (!st.open && !admin) {
    const a = rec.access;
    const msg = st.reason === "upcoming" ? `The documentation opens on ${fmt(a.start)}.`
      : st.reason === "ended" ? `The public viewing window ended on ${fmt(a.end)}.` : "The documentation is not publicly available at the moment.";
    return (
      <main className="grid min-h-screen place-items-center bg-paper px-6">
        <meta name="robots" content="noindex" />
        <div className="max-w-md text-center">
          <Logo className="justify-center" />
          <span className="mx-auto mt-10 grid h-16 w-16 place-items-center rounded-full bg-mist text-pine">{st.reason === "upcoming" ? <CalendarClock size={28} /> : <Lock size={28} />}</span>
          <h1 className="mt-6 font-display text-4xl font-medium tracking-tight">Not available</h1>
          <p className="mt-3 text-lg text-ink-soft">{msg}</p>
          {st.reason === "upcoming" && a.scheduleEnabled && <p className="mt-2 text-sm text-muted">Window: {fmt(a.start)} → {fmt(a.end)}</p>}
          <Link href="/" className="mt-8 inline-flex rounded-full bg-pine px-6 py-3 text-sm font-semibold text-paper">Back to ThreatX AI</Link>
        </div>
      </main>
    );
  }

  const note = !st.open ? (st.reason === "off" ? "Visibility is OFF." : st.reason === "upcoming" ? `Opens ${fmt(rec.access.start)}.` : `Window ended ${fmt(rec.access.end)}.`) : "";
  return <DocsView content={publicContent(rec)} preview={!st.open} isAdmin={admin} publishedAt={rec.published_at} accessNote={note} />;
}
