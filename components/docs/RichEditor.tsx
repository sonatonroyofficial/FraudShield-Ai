"use client";
import { useEffect, useRef } from "react";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link as LinkIcon, Quote, Undo2, Redo2, Eraser } from "lucide-react";

/** Minimal WYSIWYG (contentEditable). Output is sanitised again on the server before saving. */
export default function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const cmd = (c: string, v?: string) => { ref.current?.focus(); document.execCommand(c, false, v); onChange(ref.current?.innerHTML ?? ""); };
  const link = () => { const u = prompt("Link URL (https://…)"); if (u && /^(https?:\/\/|mailto:|\/)/.test(u)) cmd("createLink", u); };
  const Btn = ({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) =>
    <button type="button" title={title} aria-label={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick} className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition hover:bg-mist hover:text-pine">{children}</button>;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white focus-within:border-pine-2 focus-within:ring-4 focus-within:ring-sage/25">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-paper px-2 py-1.5">
        <Btn title="Bold" onClick={() => cmd("bold")}><Bold size={16} /></Btn>
        <Btn title="Italic" onClick={() => cmd("italic")}><Italic size={16} /></Btn>
        <Btn title="Heading" onClick={() => cmd("formatBlock", "h3")}><Heading2 size={16} /></Btn>
        <Btn title="Sub-heading" onClick={() => cmd("formatBlock", "h4")}><Heading3 size={16} /></Btn>
        <Btn title="Bulleted list" onClick={() => cmd("insertUnorderedList")}><List size={16} /></Btn>
        <Btn title="Numbered list" onClick={() => cmd("insertOrderedList")}><ListOrdered size={16} /></Btn>
        <Btn title="Quote" onClick={() => cmd("formatBlock", "blockquote")}><Quote size={16} /></Btn>
        <Btn title="Link" onClick={link}><LinkIcon size={16} /></Btn>
        <Btn title="Paragraph / clear format" onClick={() => { cmd("formatBlock", "p"); cmd("removeFormat"); }}><Eraser size={16} /></Btn>
        <span className="mx-1 h-5 w-px bg-line" />
        <Btn title="Undo" onClick={() => cmd("undo")}><Undo2 size={16} /></Btn>
        <Btn title="Redo" onClick={() => cmd("redo")}><Redo2 size={16} /></Btn>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={() => onChange(ref.current?.innerHTML ?? "")} className="prose-docs min-h-[260px] max-h-[60vh] overflow-y-auto p-5 outline-none" />
    </div>
  );
}
