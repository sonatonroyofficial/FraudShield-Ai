"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

let counter = 0;

/** Lazy-loaded: the (large) mermaid library is only fetched when a diagram scrolls into view. */
export default function Mermaid({ code }: { code: string }) {
  const host = useRef<HTMLDivElement>(null);
  const inView = useInView(host, { once: true, margin: "200px" });
  const [error, setError] = useState("");
  useEffect(() => {
    if (!inView || !host.current) return;
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false, securityLevel: "strict", theme: "base", fontFamily: "Inter, sans-serif",
          themeVariables: { primaryColor: "#e4ede8", primaryBorderColor: "#2b6358", primaryTextColor: "#13231f", lineColor: "#5c8b78", secondaryColor: "#e8dfcc", tertiaryColor: "#f6f4ee", fontSize: "14px" },
          flowchart: { curve: "basis", htmlLabels: true },
        });
        const { svg } = await mermaid.render("mmd-" + ++counter, code);
        if (!cancelled && host.current) { host.current.innerHTML = svg; setError(""); }
      } catch (e) { if (!cancelled) setError("Diagram syntax error — check the Mermaid text in Admin → Docs."); }
    })();
    return () => { cancelled = true; };
  }, [inView, code]);
  return (
    <div className="overflow-x-auto rounded-3xl border border-line bg-white p-5 shadow-soft">
      <div ref={host} className="flex min-h-[200px] items-center justify-center [&_svg]:h-auto [&_svg]:max-w-full">
        {!error && <span className="text-sm text-muted">Loading diagram…</span>}
      </div>
      {error && <p className="text-sm text-clay">{error}</p>}
    </div>
  );
}
