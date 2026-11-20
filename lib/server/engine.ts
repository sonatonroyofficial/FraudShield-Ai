import { ACTIONS, LIMITS, MESSAGE_RULES, SUMMARY, analyzeUrl, contextAround, detectLanguage, extractIndicators, levelFrom } from "@/lib/analyze";
import { analyzeWithLlm, type LlmRisk, type ScamType } from "./llm";
import { checkUrls } from "./threatIntel";
import type { Bi, Indicator, InputType, ScanResult } from "@/types";

const SCAM_LABEL: Record<ScamType, Bi> = {
  phishing: { en: "Phishing", bn: "ফিশিং" },
  impersonation: { en: "Impersonation", bn: "ছদ্মবেশ ধারণ" },
  otp_pin_theft: { en: "OTP / PIN theft", bn: "OTP / PIN চুরি" },
  payment_scam: { en: "Suspicious payment demand", bn: "সন্দেহজনক টাকা দাবি" },
  fake_job: { en: "Fake job offer", bn: "ভুয়া চাকরির অফার" },
  investment_scam: { en: "Investment scam", bn: "বিনিয়োগ প্রতারণা" },
  prize_scam: { en: "Prize / reward scam", bn: "পুরস্কার প্রতারণা" },
  other_suspicious: { en: "Other suspicious pattern", bn: "অন্যান্য সন্দেহজনক ধরন" },
  none: { en: "No scam pattern identified", bn: "কোনো প্রতারণার ধরন শনাক্ত হয়নি" },
};
const LLM_BASE: Record<LlmRisk, number> = { none: 0, low: 15, medium: 40, high: 70 };
// rules that indicate a concrete harmful request (not just tone)
const HARMFUL = new Set(["otp", "fee", "invest", "prize"]);

export async function analyzeMessage(text: string, type: InputType = "message"): Promise<ScanResult> {
  const id = "scan_" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  const found = type === "url" ? { urls: [text.trim()], phones: [] as string[] } : extractIndicators(text);

  // 1) rule engine
  const ruleInds: (Indicator & { rid: string })[] = [];
  for (const r of type === "url" ? [] : MESSAGE_RULES) {
    const m = text.match(r.re);
    if (m) ruleInds.push({ rid: r.id, name: r.name, reason: r.reason, weight: r.weight, evidence: contextAround(text, m.index ?? 0, m[0].length), match: m[0], source: type === "image" ? "ocr" : "rules" });
  }
  // 2) URL heuristics + 3) licensed threat intelligence
  const urlInds: Indicator[] = found.urls.slice(0, 3).flatMap((u) => analyzeUrl(u));
  const intel = await checkUrls(found.urls);
  for (const f of intel.findings) urlInds.push({ name: { en: "Listed as unsafe by threat intelligence", bn: "থ্রেট ইন্টেলিজেন্সে ঝুঁকিপূর্ণ হিসেবে তালিকাভুক্ত" }, reason: { en: "A licensed threat-intelligence service flags this address as dangerous.", bn: "একটি লাইসেন্সপ্রাপ্ত থ্রেট ইন্টেলিজেন্স সেবা এই ঠিকানাটিকে বিপজ্জনক বলে চিহ্নিত করেছে।" }, weight: 60, evidence: `${f.url} (${f.matches.join(", ")})`, source: "url-rules" });

  // 4) contextual LLM
  const llm = await analyzeWithLlm(text, {
    input_type: type, rules: ruleInds.map((r) => r.rid), urls: found.urls,
    urlFindings: urlInds.map((u) => u.name.en), threatIntel: intel.checked ? (intel.findings.length ? "match found" : "no match (not a safety guarantee)") : "not checked",
  });

  // validated LLM indicators: phrase must really exist in the message
  const lower = text.toLowerCase();
  const llmInds: Indicator[] = (llm?.indicators ?? []).filter((i) => i.phrase.trim().length > 1 && lower.includes(i.phrase.trim().toLowerCase()))
    .map((i) => ({ name: i.name, reason: i.reason, weight: i.weight, evidence: i.phrase.trim(), match: i.phrase.trim(), source: (type === "image" ? "ocr" : "rules") as "ocr" | "rules" }));

  // 5) evidence / risk engine
  const rulesScore = Math.min(100, ruleInds.reduce((s, i) => s + i.weight, 0) + urlInds.reduce((s, i) => s + Math.round(i.weight * 0.8), 0));
  let score = rulesScore;
  if (llm) {
    score = Math.round(0.5 * LLM_BASE[llm.risk] + 0.5 * rulesScore);
    if (llm.risk === "high" && rulesScore >= 20) score = Math.max(score, 60);
    if (llm.risk === "medium" && rulesScore >= 30) score = Math.max(score, 35);
    const harmful = ruleInds.some((r) => HARMFUL.has(r.rid)) && !llm.is_informational;
    if (llm.is_informational && !harmful && intel.findings.length === 0) score = Math.min(score, 25); // harmless mention of scam words
    if (intel.findings.length) score = Math.max(score, 70);
  }
  const level = levelFrom(score, found.urls.length > 0, text.trim().length);

  // merge indicators (LLM first, drop rule hits that overlap an LLM phrase)
  const merged: Indicator[] = [...llmInds];
  for (const r of ruleInds) {
    if (llm?.is_informational && score <= 25) continue; // harmless mention of scam words is not evidence
    if (!llmInds.some((l) => l.match!.toLowerCase().includes(r.match!.toLowerCase()) || r.match!.toLowerCase().includes(l.match!.toLowerCase()))) merged.push(r);
  }
  for (const u of urlInds) if (!merged.some((m) => m.name.en.toLowerCase() === u.name.en.toLowerCase())) merged.push(u);
  for (let i = merged.length - 1; i >= 0; i--) if (merged.findIndex((m) => m.name.en.toLowerCase() === merged[i].name.en.toLowerCase() && m.evidence === merged[i].evidence) !== i) merged.splice(i, 1);
  const limitations: Bi[] = [...(llm?.limitations?.length ? llm.limitations : LIMITS.slice(0, 2))];
  limitations.push(intel.checked
    ? { en: "A licensed threat-intelligence lookup found no match, which does not prove a link is safe.", bn: "লাইসেন্সপ্রাপ্ত থ্রেট ইন্টেলিজেন্স যাচাইয়ে মিল পাওয়া যায়নি, কিন্তু এতে লিংক নিরাপদ প্রমাণ হয় না।" }
    : { en: "No licensed threat-intelligence lookup was performed for links in this scan.", bn: "এই স্ক্যানে লিংকগুলোর জন্য লাইসেন্সপ্রাপ্ত থ্রেট ইন্টেলিজেন্স যাচাই করা হয়নি।" });
  if (!llm) limitations.push({ en: "The contextual AI layer was unavailable, so this result uses rule-based analysis only.", bn: "প্রসঙ্গভিত্তিক AI স্তর পাওয়া যায়নি, তাই এই ফলাফল শুধু নিয়মভিত্তিক বিশ্লেষণে তৈরি।" });

  return {
    scan_id: id, status: "completed", input_type: type, language: type === "url" ? "en" : !llm ? detectLanguage(text) : /[ঀ-৿]/.test(text) ? (llm.language === "en" ? "bn" : llm.language) : llm.language === "bn" ? "banglish" : llm.language, risk_level: level,
    summary: llm && (level === "high" || level === "suspicious") ? llm.summary : SUMMARY[level],
    explanation: llm?.explanation, scam_type: llm && llm.scam_type !== "none" ? SCAM_LABEL[llm.scam_type] : undefined,
    indicators: merged.sort((a, b) => b.weight - a.weight).slice(0, 10),
    recommended_actions: llm?.actions?.length ? llm.actions : ACTIONS[level],
    limitations, extracted: found, input_preview: type === "image" ? "screenshot" : text.trim().slice(0, 600), extracted_text: type === "image" ? text.trim().slice(0, 2000) : undefined, created_at: new Date().toISOString(),
    engine: { llm: !!llm, rules: true, threat_intel: intel.checked },
  };
}
