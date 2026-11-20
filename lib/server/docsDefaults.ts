import type { DocsAccess, DocsContent, DocsRecord, FeatureRow } from "@/lib/docsTypes";

/** Static catalogue of features. `status` here is the *intended* status; live.ts downgrades to
    "degraded" when a runtime dependency (LLM key, database, ...) is not actually available. */
export const FEATURE_CATALOG: (FeatureRow & { needs?: "llm" | "db" | "threat" })[] = [
  { id: "msg", name: "Smart message scanner", desc: "Bangla, English and Banglish messages: rules + contextual LLM + evidence engine.", status: "live", needs: "llm" },
  { id: "url", name: "Link inspector", desc: "URL structure, look-alike domains, shorteners; optional licensed threat intelligence.", status: "live" },
  { id: "img", name: "Screenshot analyzer", desc: "Vision OCR reads the screenshot, then the same analysis pipeline runs.", status: "live", needs: "llm" },
  { id: "bi", name: "Bilingual reports (EN / বাংলা)", desc: "Every explanation, action and limitation generated in both languages.", status: "live" },
  { id: "ti", name: "Licensed threat intelligence", desc: "Google Web Risk lookup (provider-independent interface).", status: "live", needs: "threat" },
  { id: "rep", name: "Community reporting", desc: "Voluntary reports, de-duplicated by content hash, held as pending.", status: "live", needs: "db" },
  { id: "mod", name: "Admin moderation", desc: "Approve / reject / request info before anything becomes a shared alert.", status: "live", needs: "db" },
  { id: "ana", name: "Admin analytics", desc: "Live scan volume and risk distribution (metadata only, never message text).", status: "live", needs: "db" },
  { id: "docs", name: "Live /docs module", desc: "This pitch deck + technical documentation, with scheduled public access.", status: "live" },
  { id: "rag", name: "Similar-campaign retrieval (RAG)", desc: "Retrieve moderator-approved reports as grounding evidence for the LLM.", status: "upcoming" },
  { id: "ml", name: "ML text classifier", desc: "TF-IDF + Logistic Regression baseline, then a multilingual transformer.", status: "upcoming" },
  { id: "acc", name: "User accounts & synced history", desc: "Email verification, Argon2id passwords, saved scans across devices.", status: "planned" },
  { id: "ext", name: "Browser extension", desc: "Check links and pages in place while browsing.", status: "planned" },
  { id: "api", name: "Business dashboard & public API", desc: "Team accounts, analytics and an API for small businesses and e-commerce.", status: "planned" },
];

const ARCH = `flowchart LR
  U[User - Web UI Next.js] -->|HTTPS JSON| A[API route handlers]
  A --> R[Rule engine]
  A --> H[URL heuristics]
  A --> T[Threat intel provider]
  A --> V[Vision OCR]
  A --> L[Contextual LLM]
  R --> E[Evidence and risk engine]
  H --> E
  T --> E
  L --> E
  V --> A
  E --> A
  A -->|metadata only| D[(MongoDB)]
  U -->|community report| A
  M[Admin console] -->|moderate| D`;

const FLOW = `flowchart TD
  I[Input: message, link or screenshot] --> P[Preprocess: validate, OCR, language, extract URLs]
  P --> R1[Rules]
  P --> R2[URL checks]
  P --> R3[Threat intel]
  R1 --> AI[Contextual AI: intent and meaning]
  R2 --> AI
  R3 --> AI
  AI --> RE[Risk engine: combine and dampen harmless mentions]
  RE --> O[Output: level, scam type, highlights, evidence, actions, limits]
  O --> F[Feedback: user reports scam]
  F --> MOD[Moderator review]
  MOD --> C[Approved community alert]`;

export function defaultContent(): DocsContent {
  const S = (id: string, title: string, group: "pitch" | "tech", html: string, extra: Partial<DocsContent["sections"][number]> = {}) =>
    ({ id, title, group, type: "rich" as const, visible: true, html, ...extra });
  return {
    title: "ThreatX AI",
    tagline: "Detect. Understand. Prevent. Protect.",
    team: { name: "", members: [] },
    changelog: [
      { version: "0.5.0", date: "2026-11-20", notes: ["Live /docs module with scheduled public access, team section, live data and Markdown/PDF export", "Real screenshot analysis (vision OCR) and link analysis through the full engine"] },
      { version: "0.4.0", date: "2026-11-20", notes: ["MongoDB persistence: privacy-safe scan metadata, community reports, moderation queue", "Admin dashboard reads live data"] },
      { version: "0.3.0", date: "2026-11-20", notes: ["Hybrid scam engine: rules + URL heuristics + threat-intel interface + OpenAI contextual analysis + evidence engine", "Bilingual (EN/বাংলা) structured output"] },
      { version: "0.2.0", date: "2026-11-20", notes: ["Admin console with server-side login and signed session cookie", "Rebrand to ThreatX AI"] },
      { version: "0.1.0", date: "2026-11-20", notes: ["Responsive Next.js frontend: landing, scanner, result, community, dashboard, about"] },
    ],
    sections: [
      S("problem", "Problem", "pitch", `<p>People in Bangladesh receive scam messages every day: fake bKash/Nagad suspension notices, phishing links, fake job offers that ask for fees, fake prizes and unrealistic investment promises.</p><ul><li>Scams arrive in <strong>Bangla, English and Banglish</strong> — most tools only handle English.</li><li>Existing tools flag <em>known</em> bad sites, but ordinary users also need to understand <strong>why</strong> a message is dangerous.</li><li>A wrong click or a shared OTP is often irreversible.</li></ul>`),
      S("solution", "Solution", "pitch", `<p>ThreatX AI is a calm, evidence-based second opinion. Paste a message, link or screenshot and get a clear report in seconds:</p><ul><li><strong>Risk level</strong> — High risk, Suspicious, Needs verification, or No known threat detected.</li><li><strong>Detected scam type</strong> and the exact phrases that triggered the warning.</li><li><strong>Plain-language explanation</strong>, what could not be verified, and safe next steps — in English and বাংলা.</li></ul><blockquote>We never claim a message is authentic or safe from text alone.</blockquote>`),
      S("why-now", "Why Now", "pitch", `<ul><li>Mobile financial services and social commerce are part of everyday life, which also makes them a daily target.</li><li>Modern LLMs finally understand <strong>intent in Bangla and Banglish</strong>, not just keywords.</li><li>Structured-output APIs make it practical to combine an LLM with rules and threat intelligence <em>without</em> trusting the LLM blindly.</li></ul><p><em>Market-size and fraud-volume figures are intentionally omitted until they can be backed by reliable, current sources.</em></p>`),
      S("demo", "Product Demo", "pitch", `<p>Three ways to check, one consistent result:</p><ol><li><strong>Message</strong> — paste an SMS, email, WhatsApp or social message.</li><li><strong>Link</strong> — paste a web address; look-alike domains, shorteners and login traps are explained. The server never opens the link.</li><li><strong>Screenshot</strong> — upload an image; the text is read with vision OCR and analysed like a message.</li></ol><p><a href="/scanner">Open the live scanner →</a></p>`),
      S("market", "Market Opportunity", "pitch", `<p><strong>Initial market:</strong> individual users and small businesses in Bangladesh.</p><ul><li>General internet users, online shoppers and social-commerce buyers.</li><li>Students and job seekers targeted by fake recruitment offers.</li><li>Small and e-commerce businesses facing impersonation and suspicious customer messages.</li><li><em>Later:</em> banks and MFS providers as threat-intelligence customers — not dependencies for the MVP.</li></ul>`),
      S("business", "Business Model", "pitch", `<table><thead><tr><th>Tier</th><th>Offer</th><th>Revenue</th></tr></thead><tbody><tr><td>Consumers</td><td>Free scans, privacy-first</td><td>Freemium: history, family protection</td></tr><tr><td>Small businesses</td><td>Team accounts, business dashboard</td><td>Subscription</td></tr><tr><td>Platforms &amp; institutions</td><td>Fraud-analysis API, emerging-pattern intelligence</td><td>Usage-based / enterprise</td></tr></tbody></table>`),
      { id: "traction", title: "Traction", group: "pitch", type: "live", visible: true, html: `<p>We report only what the system can prove. The figures below are read <strong>live</strong> from the running application — no manual numbers, no vanity metrics.</p>` },
      S("competition", "Competition", "pitch", `<table><thead><tr><th>Alternative</th><th>Strength</th><th>Gap ThreatX fills</th></tr></thead><tbody><tr><td>URL reputation services (e.g. Safe Browsing / Web Risk, VirusTotal)</td><td>Known-bad indicators</td><td>Miss brand-new scams; do not explain messages, payment requests or screenshots</td></tr><tr><td>General chatbots</td><td>Flexible reasoning</td><td>No evidence trail, can be prompt-injected, no calibrated risk categories</td></tr><tr><td>Bank / MFS awareness SMS</td><td>Trusted source</td><td>Generic; cannot analyse the message you actually received</td></tr></tbody></table>`),
      S("advantage", "Unique Advantage", "pitch", `<ul><li><strong>Hybrid, not a chatbot:</strong> rules + URL analysis + threat intelligence + contextual LLM, merged by a separate evidence engine.</li><li><strong>Context over keywords:</strong> a bank's “never share your OTP” notice is not flagged as fraud.</li><li><strong>Bangla / Banglish native</strong> with bilingual output.</li><li><strong>Honest by design:</strong> shows evidence and limits; never a false “Safe”, never an invented probability.</li><li><strong>Privacy-first:</strong> scan text is not stored; community reports are moderated.</li></ul>`),
      S("gtm", "Go-To-Market", "pitch", `<ol><li><strong>Free web tool</strong> that works on any Android phone — no sign-up.</li><li><strong>Community loop:</strong> every report improves shared alerts after moderator review.</li><li><strong>Distribution:</strong> students and job-seeker communities, social-commerce groups, awareness partnerships.</li><li><strong>Small-business tier</strong> once usage proves value; institutional API later.</li></ol>`),
      { id: "team", title: "Team", group: "pitch", type: "team", visible: true },
      S("vision", "Vision", "pitch", `<p>Make digital transactions and online interactions safer through accessible, intelligent and proactive fraud prevention — so that nobody has to be a security expert to avoid being scammed.</p>`),

      S("overview", "Product Overview", "tech", `<p><strong>What it does:</strong> analyses suspicious messages, links and screenshots and returns an evidence-based risk report with scam type, highlighted phrases, explanation, limitations and next steps.</p><p><strong>Target users:</strong> everyday users, online shoppers, students/job seekers, small businesses.</p><p><strong>Core use cases:</strong> check a payment-suspension SMS, inspect a link before opening, analyse a screenshot of a chat, report a scam for moderated community alerts.</p>`),
      { id: "features", title: "Feature Matrix", group: "tech", type: "features", visible: true, html: `<p>Status is <strong>live-synced</strong>: a feature shows <em>Degraded</em> automatically if a runtime dependency (LLM key, database, threat-intel key) is unavailable.</p>` },
      { id: "architecture", title: "Architecture", group: "tech", type: "mermaid", visible: true, mermaid: ARCH, caption: "UI → API route handlers → analysis services → database. Editable in Admin → Docs." },
      { id: "dataflow", title: "Data Flow", group: "tech", type: "mermaid", visible: true, mermaid: FLOW, caption: "Input → processing → AI → output → feedback loop." },
      S("stack", "Technology Stack", "tech", `<table><thead><tr><th>Layer</th><th>Technology</th></tr></thead><tbody><tr><td>Frontend</td><td>Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide</td></tr><tr><td>Backend</td><td>Next.js route handlers (Node runtime), middleware-protected admin</td></tr><tr><td>Database</td><td>MongoDB (Atlas) — scan metadata, reports, docs content; local file fallback for docs</td></tr><tr><td>AI</td><td>OpenAI <code>gpt-4o-mini</code> — structured JSON output; vision OCR for screenshots</td></tr><tr><td>Threat intelligence</td><td>Provider-independent interface; Google Web Risk implementation (key optional)</td></tr><tr><td>Diagrams</td><td>Mermaid (lazy-loaded)</td></tr></tbody></table>`),
      S("api", "API Documentation", "tech", `<table><thead><tr><th>Method &amp; path</th><th>Purpose</th><th>Auth</th></tr></thead><tbody><tr><td><code>POST /api/scan/message</code></td><td>Analyse a message. Body: <code>{ "text": "…" }</code> (≤ 5000 chars)</td><td>Public, rate-limited</td></tr><tr><td><code>POST /api/scan/url</code></td><td>Analyse a link (never fetched). Body: <code>{ "url": "…" }</code></td><td>Public, rate-limited</td></tr><tr><td><code>POST /api/scan/image</code></td><td>Analyse a screenshot. Body: <code>{ "image": "data:image/jpeg;base64,…" }</code></td><td>Public, rate-limited</td></tr><tr><td><code>GET /api/reports</code></td><td>Approved community alerts</td><td>Public</td></tr><tr><td><code>POST /api/reports</code></td><td>Submit a report (held as pending)</td><td>Public, rate-limited</td></tr><tr><td><code>GET /api/docs/live</code></td><td>Live system snapshot used by this page</td><td>Public when docs are open</td></tr><tr><td><code>/api/admin/*</code></td><td>Login, logout, moderation, stats, docs editing</td><td>Admin session cookie</td></tr></tbody></table><p><strong>Response (scan):</strong> <code>risk_level, scam_type, summary, explanation, indicators[{name, evidence, reason}], recommended_actions[], limitations[], engine</code>. All text fields are bilingual (<code>en</code>, <code>bn</code>).</p><p><strong>External APIs used:</strong> OpenAI Chat Completions (analysis, vision), Google Web Risk (optional).</p>`),
      S("data", "Data Layer", "tech", `<ul><li><strong>Inputs:</strong> user-submitted text, URL or image. No scraping of third-party pages; submitted links are analysed as text and are never opened.</li><li><strong>Stored:</strong> per-scan <em>metadata only</em> (risk level, language, scam type, content hash, timestamp). Raw message text and screenshots are <strong>not</strong> stored.</li><li><strong>Community reports:</strong> stored as pending, de-duplicated by normalised content hash, shown publicly only after moderator approval.</li><li><strong>Privacy:</strong> UI warns users not to include OTPs, PINs or passwords; secrets live in environment variables only.</li></ul>`),
      S("ai", "AI Layer", "tech", `<ul><li><strong>Models:</strong> OpenAI <code>gpt-4o-mini</code> (contextual analysis and vision OCR).</li><li><strong>Not the sole judge:</strong> final risk level comes from an evidence engine that combines rule hits, URL findings, threat intelligence and the LLM's risk tier; harmless mentions of scam words are dampened.</li><li><strong>Explainability:</strong> every indicator carries the exact phrase and the reason; phrases are verified to exist in the input (hallucinated evidence is discarded).</li><li><strong>RAG / GraphRAG:</strong> not used today. <em>Planned:</em> retrieve moderator-approved similar reports as grounding evidence.</li><li><strong>Personalisation:</strong> language preference only (EN / বাংলা).</li></ul>`),
      S("roadmap", "Product Roadmap", "tech", `<table><thead><tr><th>Horizon</th><th>Focus</th></tr></thead><tbody><tr><td>Short term</td><td>Licensed threat-intel key, evaluation set (Bangla / Banglish), RAG over approved reports, hardened rate-limiting</td></tr><tr><td>Mid term</td><td>ML baseline classifier, accounts &amp; synced history, campaign detection, browser extension</td></tr><tr><td>Long term</td><td>Business dashboard, team accounts, public API, mobile app, institutional intelligence feed</td></tr></tbody></table>`),
      S("performance", "Performance & Scalability", "tech", `<ul><li>Cheap, fast model with low temperature and strict structured output; one call returns both languages.</li><li>Inputs are capped (messages 5000 chars; screenshots downscaled to ≤ 1600 px before upload).</li><li>Stateless route handlers scale horizontally; database writes are metadata-only and indexed.</li><li>Docs page: server-rendered, live data cached for 30 s, diagrams lazy-loaded.</li><li><em>Not yet load-tested</em> — formal benchmarks are on the roadmap.</li></ul>`),
      S("security", "Security", "tech", `<ul><li><strong>Auth:</strong> admin login checked server-side; HMAC-signed httpOnly cookie; constant-time comparison; middleware protects <code>/admin</code>; admin APIs re-verify the cookie.</li><li><strong>RBAC:</strong> single admin role today; Super Admin / moderator roles planned with accounts.</li><li><strong>Injection:</strong> submitted content is treated as untrusted data inside delimiters; LLM output is schema-validated.</li><li><strong>Abuse controls:</strong> per-IP rate limits, size limits, SSRF-safe (links are never fetched).</li><li><strong>Data protection:</strong> no raw scan text stored; secrets only in environment variables; HTML in docs is sanitised on save and on read.</li></ul>`),
      { id: "analytics", title: "Analytics", group: "tech", type: "live", visible: true, html: `<p><strong>KPIs tracked:</strong> scans per day, risk-level distribution, approved community alerts, engine availability. Evaluation KPIs (precision, recall, false-positive rate) will be added once a labelled test set exists.</p>` },
      S("contributors", "Team & Contributors", "tech", `<p>See the <a href="#team">Team section</a> for members and roles. Contributions follow the modular layout: <code>lib/server/*</code> (engine, providers), <code>app/api/*</code> (routes), <code>components/*</code> (UI).</p>`),
      { id: "changelog", title: "Changelog", group: "tech", type: "changelog", visible: true },
    ],
  };
}

export function defaultAccess(now = new Date()): DocsAccess {
  // Default public window: June 10 00:00 → June 14 23:59 (Bangladesh time, UTC+6), next upcoming June.
  const endThisYear = new Date(`${now.getUTCFullYear()}-06-14T23:59:00+06:00`);
  const year = now > endThisYear ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
  return { visible: true, scheduleEnabled: true, start: new Date(`${year}-06-10T00:00:00+06:00`).toISOString(), end: new Date(`${year}-06-14T23:59:00+06:00`).toISOString() };
}

export function seedRecord(): DocsRecord {
  const c = defaultContent();
  const now = new Date().toISOString();
  return { access: defaultAccess(), draft: c, published: structuredClone(c), versions: [{ id: "v-seed", at: now, label: "Initial version", content: structuredClone(c) }], updated_at: now, published_at: now };
}
