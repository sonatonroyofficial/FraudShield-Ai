"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Reveal({ children, delay = 0, y = 28, className = "", as = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section" }) {
  const M = motion[as] as typeof motion.div;
  return (
    <M initial={{ opacity: 0, y, filter: "blur(8px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-70px" }} transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </M>
  );
}
