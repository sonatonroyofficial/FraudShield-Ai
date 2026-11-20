"use client";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import type { TeamMember } from "@/lib/docsTypes";

const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
const GRAD = ["from-pine to-pine-2", "from-pine-2 to-sage", "from-slate to-sage", "from-amber to-sand"];

/** Uniform cards: square 1:1 photo, same frame, same spacing; gradient-initials fallback. */
export default function TeamGrid({ name, members }: { name: string; members: TeamMember[] }) {
  if (!members.length) return <p className="rounded-2xl bg-sand/50 p-5 text-sm text-ink-soft">Team details will appear here.</p>;
  return (
    <div>
      {name && <p className="mb-5 font-display text-2xl text-ink">{name}</p>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m, i) => (
          <motion.article key={m.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 6) * 0.07, duration: 0.7 }} whileHover={{ y: -5 }}
            className="overflow-hidden rounded-3xl border border-line bg-white p-4 shadow-soft transition-shadow hover:shadow-lift">
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-mist ring-1 ring-line">
              {m.photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.photo} alt={m.name} loading="lazy" width={400} height={400} className="h-full w-full object-cover" />
                : <div className={`grid h-full w-full place-items-center bg-gradient-to-br ${GRAD[i % GRAD.length]} font-display text-6xl text-paper`}>{initials(m.name)}</div>}
            </div>
            <div className="px-1 pb-1 pt-4">
              <h3 className="font-display text-xl font-medium leading-tight text-ink">{m.name || "Team member"}</h3>
              <p className="mt-0.5 text-sm font-medium text-pine-2">{m.role}</p>
              {m.email && <a href={`mailto:${m.email}`} className="mt-3 inline-flex max-w-full items-center gap-2 truncate text-sm text-ink-soft hover:text-pine"><Mail size={14} className="shrink-0" /><span className="truncate">{m.email}</span></a>}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
