import type { Bi, Indicator, InputType, RiskLevel, ScanResult } from "@/types";

/* Client-side demonstration engine. In production this is replaced by the
   FastAPI hybrid engine (rules + ML + threat-intel + contextual AI). */

interface Rule { id: string; name: Bi; reason: Bi; weight: number; re: RegExp }

const R = (s: string) => new RegExp(s, "iu");

const MESSAGE_RULES: Rule[] = [
  { id: "otp", weight: 38,
    name: { en: "Request for OTP / PIN / password", bn: "OTP / PIN / পাসওয়ার্ড চাওয়া" },
    reason: { en: "Legitimate services never ask you to share an OTP, PIN or password in a message.", bn: "বৈধ প্রতিষ্ঠান কখনো মেসেজে OTP, PIN বা পাসওয়ার্ড চায় না।" },
    re: R("(otp|\\bpin\\b|password|passcode|পিন|ওটিপি|পাসওয়ার্ড|code\\s*(share|send|dao|din))") },
  { id: "urgency", weight: 24,
    name: { en: "Urgency and fear tactics", bn: "তাড়াহুড়ো ও ভয় দেখানো" },
    reason: { en: "Pressure to act immediately is a common way to stop you from thinking or verifying.", bn: "দ্রুত কাজ করতে চাপ দেওয়া হয় যাতে আপনি ভাবার বা যাচাই করার সময় না পান।" },
    re: R("(immediately|right now|within\\s+\\d+\\s*(hours?|minutes?)|today|urgent|asap|expire|\\bnow\\b|এখনই|এক্ষুনি|আজকেই|জরুরি|ekhoni|ekhuni|ajkei|joruri|turant)") },
  { id: "suspend", weight: 26,
    name: { en: "Threat of account suspension", bn: "অ্যাকাউন্ট বন্ধের হুমকি" },
    reason: { en: "Messages that threaten to block or suspend your account are a classic phishing pattern.", bn: "অ্যাকাউন্ট ব্লক বা বন্ধের হুমকি দেওয়া একটি পরিচিত ফিশিং কৌশল।" },
    re: R("(suspend|blocked?|deactivat|locked|terminate|disable|বন্ধ\\s*হয়ে|ব্লক|bondho|block\\s*hoye|bond\\s*hoye)") },
  { id: "verify", weight: 20,
    name: { en: "Account verification request", bn: "অ্যাকাউন্ট যাচাইয়ের অনুরোধ" },
    reason: { en: "Unexpected 'verify your account' requests are often credential-harvesting attempts.", bn: "অপ্রত্যাশিত 'অ্যাকাউন্ট যাচাই করুন' অনুরোধ প্রায়ই তথ্য চুরির চেষ্টা।" },
    re: R("(verify|confirm your|update your (account|details|kyc)|kyc|যাচাই|ভেরিফাই|verify\\s*korun|update\\s*korun)") },
  { id: "prize", weight: 30,
    name: { en: "Unexpected prize or reward", bn: "অপ্রত্যাশিত পুরস্কার বা অফার" },
    reason: { en: "Unrequested prizes, lotteries and cashback are used to lure people into sharing details or paying fees.", bn: "অযাচিত লটারি, পুরস্কার বা ক্যাশব্যাক দিয়ে তথ্য বা ফি আদায়ের চেষ্টা করা হয়।" },
    re: R("(you (have )?won|winner|congratulations|lottery|prize|cashback|reward|gift\\s*card|বিজয়ী|অভিনন্দন|লটারি|পুরস্কার|জিতেছেন|jitechen|puroskar)") },
  { id: "fee", weight: 30,
    name: { en: "Advance fee or payment demand", bn: "অগ্রিম ফি বা টাকা দাবি" },
    reason: { en: "Asking for money before a job, parcel or refund is released is a strong scam signal.", bn: "চাকরি, পার্সেল বা রিফান্ডের আগে টাকা চাওয়া একটি জোরালো প্রতারণার সংকেত।" },
    re: R("(registration fee|processing fee|advance (payment|fee)|send (money|tk|taka)|pay (a )?fee|customs fee|অগ্রিম|রেজিস্ট্রেশন ফি|টাকা\\s*(পাঠান|দিন)|taka\\s*(pathan|din)|advance\\s*(den|pay))") },
  { id: "mfs", weight: 14,
    name: { en: "Mobile-banking / MFS impersonation", bn: "মোবাইল ব্যাংকিং-এর নাম ব্যবহার" },
    reason: { en: "The message invokes a payment brand. Scammers frequently imitate bKash, Nagad, Rocket and banks.", bn: "মেসেজে পেমেন্ট ব্র্যান্ডের নাম আছে। প্রতারকরা প্রায়ই বিকাশ, নগদ, রকেট ও ব্যাংকের নাম ব্যবহার করে।" },
    re: R("(bkash|nagad|rocket|upay|bank|mobile banking|বিকাশ|নগদ|রকেট|ব্যাংক)") },
  { id: "invest", weight: 30,
    name: { en: "Unrealistic investment returns", bn: "অবাস্তব মুনাফার প্রতিশ্রুতি" },
    reason: { en: "Guaranteed or very high returns are a hallmark of investment fraud.", bn: "নিশ্চিত বা অস্বাভাবিক মুনাফার প্রতিশ্রুতি বিনিয়োগ প্রতারণার লক্ষণ।" },
    re: R("(guaranteed (profit|return)|double your|\\d{2,3}%\\s*(profit|return|daily)|risk[- ]free|দ্বিগুণ|নিশ্চিত\\s*লাভ|দৈনিক\\s*লাভ|dwigun|nishchit\\s*labh)") },
  { id: "secret", weight: 12,
    name: { en: "Secrecy request", bn: "গোপন রাখার অনুরোধ" },
    reason: { en: "Asking you not to tell anyone prevents friends or family from warning you.", bn: "কাউকে না জানাতে বলা হয় যাতে পরিবার বা বন্ধুরা সতর্ক করতে না পারে।" },
    re: R("(don'?t tell|keep (this )?(secret|confidential)|do not share this with|কাউকে\\s*বলবেন\\s*না|গোপন\\s*রাখুন|kauke\\s*bolben\\s*na)") },
];

const BRANDS = ["bkash", "nagad", "rocket", "upay", "paypal", "google", "facebook", "daraz", "amazon", "apple", "microsoft", "netflix", "dutchbangla", "brac", "islami", "citybank", "dbbl", "whatsapp", "instagram"];
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "rb.gy", "ow.ly", "shorturl.at", "tiny.cc"];
const RISKY_TLDS = [".xyz", ".top", ".click", ".live", ".icu", ".buzz", ".tk", ".ml", ".gq", ".cf", ".rest", ".monster", ".cyou"];
const LOGIN_WORDS = /(login|signin|sign-in|verify|verification|secure|account|update|confirm|wallet|payment|otp|kyc|bonus|claim)/i;

export function detectLanguage(text: string): ScanResult["language"] {
  const bn = (text.match(/[ঀ-৿]/g) || []).length;
  if (bn > text.replace(/\s/g, "").length * 0.25) return "bn";
  if (/\b(apnar|apni|korun|hoye|jabe|bondho|ekhoni|taka|pathan|din|jitechen|amar|kore|noyto|nahole)\b/i.test(text)) return "banglish";
  return "en";
}

export function extractIndicators(text: string) {
  const urls = Array.from(new Set(text.match(/\b((https?:\/\/|www\.)[^\s<>"']+|[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|net|org|xyz|top|click|live|icu|info|co|bd|link|site|online|buzz|tk)(\/[^\s<>"']*)?)/gi) || []));
  const phones = Array.from(new Set(text.match(/(\+?88)?01[3-9]\d{8}\b/g) || []));
  return { urls, phones };
}

function parseUrl(raw: string): URL | null {
  try { return new URL(/^https?:\/\//i.test(raw) ? raw : `http://${raw}`); } catch { return null; }
}

export function analyzeUrl(raw: string): Indicator[] {
  const out: Indicator[] = [];
  const u = parseUrl(raw.trim());
  const add = (name: Bi, reason: Bi, weight: number, evidence: string) =>
    out.push({ name, reason, weight, evidence, source: "url-rules" });
  if (!u) {
    add({ en: "Unreadable web address", bn: "ঠিকানাটি পড়া যাচ্ছে না" }, { en: "The address could not be parsed, so it cannot be assessed reliably.", bn: "ঠিকানাটি বিশ্লেষণ করা যায়নি, তাই নির্ভরযোগ্য মূল্যায়ন সম্ভব নয়।" }, 12, raw);
    return out;
  }
  const host = u.hostname.toLowerCase();
  if (u.protocol === "http:") add({ en: "Connection is not encrypted", bn: "সংযোগ এনক্রিপ্টেড নয়" }, { en: "The link uses plain HTTP. Legitimate login and payment pages use HTTPS.", bn: "লিংকটি সাধারণ HTTP ব্যবহার করে। বৈধ লগইন ও পেমেন্ট পেজ HTTPS ব্যবহার করে।" }, 12, "http://" + host);
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) add({ en: "Raw IP address instead of a name", bn: "নামের বদলে সরাসরি IP ঠিকানা" }, { en: "Genuine brands use domain names, not bare IP addresses.", bn: "আসল প্রতিষ্ঠান ডোমেইন নাম ব্যবহার করে, সরাসরি IP নয়।" }, 32, host);
  if (SHORTENERS.some((s) => host === s)) add({ en: "Link shortener hides the destination", bn: "শর্ট লিংক আসল গন্তব্য লুকায়" }, { en: "You cannot see where this link really leads before opening it.", bn: "খোলার আগে লিংকটি আসলে কোথায় যায় তা বোঝা যায় না।" }, 22, host);
  if (host.startsWith("xn--") || host.includes(".xn--")) add({ en: "Look-alike (punycode) characters", bn: "দেখতে একই রকম অক্ষর (পিউনিকোড)" }, { en: "International characters can imitate familiar brand names.", bn: "আন্তর্জাতিক অক্ষর দিয়ে পরিচিত ব্র্যান্ডের নাম নকল করা যায়।" }, 34, host);
  if (RISKY_TLDS.some((t) => host.endsWith(t))) add({ en: "Domain ending often seen in abuse", bn: "অপব্যবহারে বহুল ব্যবহৃত ডোমেইন শেষাংশ" }, { en: "This domain ending is inexpensive and frequently used for throw-away scam sites.", bn: "এই ডোমেইন শেষাংশ সস্তা এবং অস্থায়ী প্রতারণা সাইটে প্রায়ই ব্যবহৃত হয়।" }, 20, host.slice(host.lastIndexOf(".")));
  const labels = host.split(".");
  if (labels.length >= 5) add({ en: "Unusually many subdomains", bn: "অস্বাভাবিক বেশি সাবডোমেইন" }, { en: "Long chains of subdomains are used to make a fake address look official.", bn: "লম্বা সাবডোমেইন দিয়ে ভুয়া ঠিকানাকে আসল দেখানো হয়।" }, 18, host);
  if ((host.match(/-/g) || []).length >= 3) add({ en: "Many hyphens in the domain", bn: "ডোমেইনে অনেক হাইফেন" }, { en: "Domains stuffed with hyphens often imitate a brand plus a keyword.", bn: "অনেক হাইফেনযুক্ত ডোমেইন সাধারণত ব্র্যান্ডের নকল।" }, 14, host);
  if (u.username || raw.includes("@")) add({ en: "'@' symbol inside the link", bn: "লিংকের ভেতরে '@' চিহ্ন" }, { en: "Everything before '@' is ignored by the browser and can disguise the real site.", bn: "'@'-এর আগের অংশ ব্রাউজার উপেক্ষা করে, এতে আসল সাইট আড়াল করা যায়।" }, 30, raw);
  const rootDomain = labels.slice(-2).join(".");
  const brand = BRANDS.find((b) => host.includes(b));
  if (brand && !(rootDomain === `${brand}.com` || rootDomain === `${brand}.net` || rootDomain === `${brand}.org` || host.endsWith(`${brand}.com.bd`))) {
    add({ en: `Possible look-alike of "${brand}"`, bn: `"${brand}"-এর নকল হতে পারে` }, { en: "The domain contains a well-known brand name but is not that brand's own domain.", bn: "ডোমেইনে পরিচিত ব্র্যান্ডের নাম আছে কিন্তু এটি ওই ব্র্যান্ডের নিজস্ব ডোমেইন নয়।" }, 38, host);
  }
  if (LOGIN_WORDS.test(u.pathname + u.search)) add({ en: "Login / verification wording in the path", bn: "পাথে লগইন / ভেরিফিকেশন শব্দ" }, { en: "Pages that ask you to sign in, verify or claim something deserve extra care.", bn: "যেসব পেজ লগইন, যাচাই বা দাবি করতে বলে, সেগুলো বাড়তি সতর্কতা দাবি করে।" }, 16, u.pathname + u.search);
  return out;
}

function levelFrom(score: number, hasUrls: boolean, len: number): RiskLevel {
  if (score >= 60) return "high";
  if (score >= 30) return "suspicious";
  if (score >= 8 || hasUrls || len < 25) return "verify";
  return "none";
}

const SUMMARY: Record<RiskLevel, Bi> = {
  high: { en: "Several strong scam indicators were found. Treat this as dangerous until you verify it independently.", bn: "একাধিক জোরালো প্রতারণার সংকেত পাওয়া গেছে। স্বাধীনভাবে যাচাই না করা পর্যন্ত এটিকে বিপজ্জনক ধরে নিন।" },
  suspicious: { en: "Multiple concerning indicators were found. Be careful and verify through an official channel.", bn: "একাধিক উদ্বেগজনক সংকেত পাওয়া গেছে। সতর্ক থাকুন এবং অফিসিয়াল মাধ্যমে যাচাই করুন।" },
  verify: { en: "There is not enough evidence for a reliable assessment. Please check through an official source.", bn: "নির্ভরযোগ্য মূল্যায়নের জন্য যথেষ্ট প্রমাণ নেই। অনুগ্রহ করে অফিসিয়াল উৎস থেকে যাচাই করুন।" },
  none: { en: "No known threat indicators were found. This is not a guarantee of safety — keep your normal caution.", bn: "পরিচিত কোনো ঝুঁকির সংকেত পাওয়া যায়নি। এটি নিরাপত্তার নিশ্চয়তা নয় — স্বাভাবিক সতর্কতা বজায় রাখুন।" },
};

const ACTIONS: Record<RiskLevel, Bi[]> = {
  high: [
    { en: "Do not open the link or reply.", bn: "লিংক খুলবেন না, উত্তরও দেবেন না।" },
    { en: "Never share your OTP, PIN or password with anyone.", bn: "OTP, PIN বা পাসওয়ার্ড কারো সাথে শেয়ার করবেন না।" },
    { en: "Verify using the official app or an independently obtained customer-service number.", bn: "অফিসিয়াল অ্যাপ বা নিজে খুঁজে পাওয়া কাস্টমার সার্ভিস নম্বরে যাচাই করুন।" },
    { en: "Consider reporting it so others can be warned.", bn: "অন্যদের সতর্ক করতে রিপোর্ট করার কথা ভাবুন।" },
  ],
  suspicious: [
    { en: "Pause before clicking or paying anything.", bn: "কিছুতে ক্লিক বা পেমেন্ট করার আগে থামুন।" },
    { en: "Contact the organisation through its official app or website.", bn: "প্রতিষ্ঠানের অফিসিয়াল অ্যাপ বা ওয়েবসাইটে যোগাযোগ করুন।" },
    { en: "Ask a trusted person to look at it with you.", bn: "বিশ্বস্ত কাউকে সাথে নিয়ে দেখুন।" },
  ],
  verify: [
    { en: "Check the sender through an official source.", bn: "অফিসিয়াল উৎস থেকে প্রেরক যাচাই করুন।" },
    { en: "Avoid sharing personal or payment details until verified.", bn: "যাচাই না হওয়া পর্যন্ত ব্যক্তিগত বা পেমেন্ট তথ্য দেবেন না।" },
  ],
  none: [
    { en: "Keep normal caution — new scams may not be known yet.", bn: "স্বাভাবিক সতর্কতা বজায় রাখুন — নতুন প্রতারণা এখনো পরিচিত নাও হতে পারে।" },
    { en: "Never share OTPs or PINs, whoever asks.", bn: "যে-ই চাক, OTP বা PIN শেয়ার করবেন না।" },
  ],
};

const LIMITS: Bi[] = [
  { en: "The sender or website has not been independently verified.", bn: "প্রেরক বা ওয়েবসাইট স্বাধীনভাবে যাচাই করা হয়নি।" },
  { en: "This is an evidence-based estimate, not proof of fraud or of safety.", bn: "এটি প্রমাণভিত্তিক অনুমান, প্রতারণা বা নিরাপত্তার প্রমাণ নয়।" },
  { en: "Live threat-intelligence lookups run on the FraudShield backend and are not part of this preview.", bn: "লাইভ থ্রেট-ইন্টেলিজেন্স যাচাই FraudShield ব্যাকএন্ডে চলে, এই প্রিভিউতে নেই।" },
];

export const SAMPLE_OCR = "bKash Alert: Your account will be suspended today. Verify immediately at http://bkash-secure-verify.xyz/login and share the OTP you receive to avoid permanent suspension.";

function contextAround(text: string, idx: number, len: number) {
  const start = Math.max(0, idx - 24), end = Math.min(text.length, idx + len + 24);
  return (start > 0 ? "…" : "") + text.slice(start, end).replace(/\s+/g, " ").trim() + (end < text.length ? "…" : "");
}

export function runAnalysis(input: string, type: InputType): ScanResult {
  const created = new Date().toISOString();
  const id = "scan_" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
  let text = input;
  let demo: ScanResult["demo_note"];
  if (type === "image") {
    text = SAMPLE_OCR;
    demo = { en: "Preview mode: your screenshot was not sent anywhere. A sample OCR extraction is analysed here; the real OCR service runs on the backend.", bn: "প্রিভিউ মোড: আপনার স্ক্রিনশট কোথাও পাঠানো হয়নি। এখানে একটি নমুনা OCR টেক্সট বিশ্লেষণ করা হয়েছে; আসল OCR সেবা ব্যাকএন্ডে চলে।" };
  }
  const found = extractIndicators(text);
  const indicators: Indicator[] = [];
  if (type === "url") {
    indicators.push(...analyzeUrl(text));
  } else {
    for (const r of MESSAGE_RULES) {
      const m = text.match(r.re);
      if (m) indicators.push({ name: r.name, reason: r.reason, weight: r.weight, evidence: contextAround(text, m.index ?? 0, m[0].length), match: m[0], source: type === "image" ? "ocr" : "rules" });
    }
    for (const u of found.urls.slice(0, 3)) indicators.push(...analyzeUrl(u).map((i) => ({ ...i, weight: Math.round(i.weight * 0.8) })));
    if (found.urls.length && !indicators.some((i) => i.source === "url-rules"))
      indicators.push({ name: { en: "Unverified link", bn: "যাচাই না হওয়া লিংক" }, reason: { en: "The destination domain needs independent verification before you open it.", bn: "খোলার আগে গন্তব্য ডোমেইন স্বাধীনভাবে যাচাই করা দরকার।" }, weight: 8, evidence: found.urls[0], source: "rules" });
  }
  const score = Math.min(100, indicators.reduce((s, i) => s + i.weight, 0));
  const level = levelFrom(score, found.urls.length > 0 || type === "url", text.trim().length);
  return {
    scan_id: id, status: "completed", input_type: type, language: type === "url" ? "en" : detectLanguage(text),
    risk_level: level, summary: SUMMARY[level], indicators: indicators.sort((a, b) => b.weight - a.weight),
    recommended_actions: ACTIONS[level], limitations: LIMITS, extracted: found,
    input_preview: type === "image" ? "screenshot" : text.trim().slice(0, 600), created_at: created, demo_note: demo,
  };
}
