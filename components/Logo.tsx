export default function Logo({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 2.5 5 6.8v8.4c0 6.2 4.4 11.3 11 14.3 6.6-3 11-8.1 11-14.3V6.8L16 2.5Z" fill={light ? "#f6f4ee" : "#1f4d45"} />
        <path d="M10.5 16.2 14.4 20l7.3-8" stroke={light ? "#1f4d45" : "#bfe0d1"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`font-display text-[1.28rem] font-semibold tracking-tight ${light ? "text-paper" : "text-ink"}`}>
        FraudShield<span className={light ? "text-sage" : "text-pine-2"}> AI</span>
      </span>
    </span>
  );
}
