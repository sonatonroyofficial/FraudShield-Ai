# ThreatX AI — Hackathon Submission Answers

> Everything below reflects what was **actually built and used** in this repository. Items marked **[YOU FILL]** need information only you have (links, video, team details). Nothing here is invented.

---

## 0. Project snapshot

| | |
|---|---|
| **Name** | ThreatX AI |
| **Tagline** | Detect. Understand. Prevent. Protect. |
| **What it is** | An evidence-based fraud-detection web app. Users paste a suspicious message, link or screenshot and get a calm, explained risk report — in English, বাংলা or Banglish. |
| **Market** | Bangladesh (bKash / Nagad / bank phishing, fake jobs, prize and investment scams) |
| **Stack** | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Lucide icons, OpenAI API |
| **Status** | Working prototype: real scam-analysis engine for messages; link and screenshot flows are rule-based / preview mode |

**Demo / Live links** — **[YOU FILL]**
- Live URL: `…`
- GitHub repo: `…`
- YouTube video: `…`

**Admin demo access** (local prototype only): `/admin` → credentials are in `.env.local` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). Do **not** publish them in a public submission; give them to judges privately.

---

## 1. Data & AI Provenance

- **Training data:** None. No model was trained or fine-tuned. The product uses a pre-trained hosted LLM plus hand-written rules.
- **Datasets:** No external dataset used. The rule patterns (OTP/PIN requests, urgency, suspension threats, advance fees, prizes, investment promises, brand impersonation, secrecy requests) were written by hand from the project blueprint (`FraudShield_AI_Complete_Project_Blueprint.docx`) in English, Bangla and Banglish.
- **User data:** Scans stay in the user's browser (`localStorage`). Message text is sent to the OpenAI API only for analysis. Raw scans are not stored on any server by the app.
- **Community / admin data:** Illustrative placeholders, clearly labelled as such in the UI.
- **Known gap:** No labelled Bangla/Banglish evaluation dataset yet (listed as future work).
- **AI-generated code:** The application code was written with AI assistance (see §2). All behaviour was reviewed and tested by running the app.

---

## 2. Tooling & IDE

| Item | Detail |
|---|---|
| **AI coding assistant / IDE** | Claude Code (Claude desktop app, Code tab) — model **Claude Sonnet 5.5** |
| **Runtime LLM (in the product)** | OpenAI **`gpt-4o-mini`** via Chat Completions with strict JSON-schema structured output |
| **Framework** | Next.js 15.5, React 19, TypeScript 5.7 |
| **UI** | Tailwind CSS v4, Framer Motion (animation), Lucide (icons), Unsplash (photography), Google Fonts (Fraunces, Inter, Hind Siliguri) |
| **Testing / verification** | `next build` (type-check + lint), live browser testing in the app's built-in browser pane, direct API calls against `/api/scan/message` |
| **OS** | Windows 11 |
| **Version control** | Git |

---

## 3. AI Development Lifecycle (AI-DLC)

**Frameworks adopted** (only true ones checked):

- [ ] AWS Kiro
- [ ] AWS AI-DLC GitHub workflow
- [ ] BMAD-METHOD
- [ ] GitHub Spec-Kit
- [ ] Cursor Rules + PRD workflow
- [ ] Cline Memory Bank
- [ ] Aider conventions
- [ ] Windsurf Rules
- [ ] Claude Skills
- [ ] AGENTS.md spec
- **Other (custom):** *Blueprint-driven single-agent development* — a written product blueprint (.docx) acted as the PRD/spec; the agent implemented it in iterative slices and verified each slice in a running browser.

**Process notes (phases, artifacts, review gates):**

1. **Spec:** `FraudShield_AI_Complete_Project_Blueprint.docx` (vision, modules, workflows, risk categories, API contracts, UX rules, safety rules).
2. **Frontend build:** design system (calm pine/sage palette, serif display type), landing page, scanner, result page, community, dashboard, about, login.
3. **Admin console:** server-side login (httpOnly signed cookie + middleware route protection), animated analytics dashboard, moderation queue.
4. **Real engine:** rule engine + URL heuristics + optional licensed threat-intel + OpenAI contextual analysis + evidence/risk engine.
5. **Review gates:** a production `next build` after each phase; live browser checks (page render, mobile-width overflow check on all pages, login/logout gate, scan flow end-to-end); API-level tests with scam vs. harmless messages; fixes for issues found (e.g. weak highlighting, hydration warning caused by a browser extension, mis-detected Banglish language).

---

## 4. LLMs / Models Used

- [x] **Claude** — Claude Sonnet 5.5, used as the coding agent (not part of the shipped product)
- [x] **ChatGPT / OpenAI** — `gpt-4o-mini`, used at runtime for contextual scam analysis
- [ ] Gemini · [ ] Kimi · [ ] DeepSeek · [ ] Llama · [ ] Mistral · [ ] Grok · [ ] Qwen

*(If you used other models to write the blueprint document, add them here — **[YOU FILL]**.)*

**How & why did you use these LLMs?**
- **Claude Sonnet 5.5** — wrote and iterated the codebase, ran builds, drove the browser to verify UI and API behaviour.
- **GPT-4o-mini** — chosen for low cost and latency with reliable structured output. It judges *meaning and intent* (so a bank's "never share your OTP" notice is not flagged as fraud), extracts the exact suspicious phrases, names the scam type, and writes the explanation, actions and limitations in **both English and Bangla** in one call. It is **not** the sole decision-maker: the final risk level comes from a separate evidence engine.

---

## 5. Prompt Usage

- **System prompt** with explicit sections: security rules, analysis rules, output rules.
- **Prompt-injection defence:** the submitted message is wrapped in `<<<MESSAGE … MESSAGE>>>` markers and declared *untrusted data, never instructions*.
- **Context-over-keywords rule:** "A harmless mention of scam words is not fraud"; a flag `is_informational` lets the model mark awareness notices, news or questions.
- **Honesty rules:** never conclude a message is authentic or safe from text alone; distinguish evidence from assumption; do not invent facts about senders or institutions.
- **Grounded hints:** the prompt includes rule-engine hits, extracted URLs, URL-heuristic findings and threat-intel status so the model reasons with independent evidence.
- **Constraints:** `indicators[].phrase` must be an exact substring copied from the message; max 8 indicators; every text field in `en` and `bn`; `temperature: 0.1` for consistency.

---

## 6. Token Optimization

**Strategies actually used**
- Small, cheap model (`gpt-4o-mini`) with low temperature.
- Strict **structured outputs** (JSON schema) — no wasted prose, no retries for parsing.
- Input capped at **5,000 characters** server-side; trivially short input rejected before any API call.
- **One call** returns bilingual output (instead of two translation calls).
- Rule engine and URL heuristics run locally first and are passed as compact hints.
- Per-IP **rate limit** (15 requests/min) to prevent abuse and cost spikes.

**Tools & methods checklist**
- [ ] Graphify · [ ] Caveman · [ ] Codeburn · [ ] LLMLingua · [ ] LongLLMLingua
- [ ] Anthropic / OpenAI / Gemini / DeepSeek prompt caching *(not explicitly configured)*
- [ ] Semantic chunk dedup · [ ] Sliding-window · [ ] Rolling summary memory
- [x] **Structured outputs / JSON mode**
- [ ] Cheap-model routing *(a single cheap model is used; no routing logic)*
- [ ] Request batching · [ ] KV-cache reuse · [ ] Speculative decoding

---

## 7. Retrieval & RAG

**Not used.** The product does not use retrieval, vector databases, embeddings or rerankers. All techniques unchecked.

- Naive RAG / Vector DB / Contextual RAG / Chunking / Graph RAG / Hybrid search / Rerankers / Agentic RAG / Self-RAG / CRAG / Query rewriting — **none**.
- **RAG architecture details:** N/A.
- *Future work:* retrieve similar approved community reports (embedding similarity) to detect repeated campaigns.

---

## 8. MCP (Model Context Protocol) Usage

- [ ] We built and/or used MCP servers/clients in this build — **No MCP servers are part of the product.**
- *Honest note:* the coding environment exposed generic tool connectors, but none were built or used as part of ThreatX AI's architecture. Leave this unchecked unless you separately used MCP.

---

## 9. Open Source Tools & Libraries

| Library | Contribution |
|---|---|
| **Next.js / React** | App framework, routing, API route handlers, middleware |
| **TypeScript** | Type safety across engine and UI |
| **Tailwind CSS v4** | Design tokens and responsive styling |
| **Framer Motion** | Page transitions, scroll reveals, animated charts, live-analysis demo |
| **Lucide React** | Icon set |
| **clsx** | Class composition |
| Web APIs (Web Crypto) | HMAC-signed admin session cookie, verified in middleware |

---

## 10. Agent Frameworks & Orchestration

**None used.** No LangGraph/CrewAI/AutoGen etc. The analysis pipeline is a deterministic orchestration in code (`lib/server/engine.ts`):

`input validation → rule engine → URL heuristics → threat-intel (optional) → LLM contextual analysis → evidence & risk engine → structured result`

Agentic frameworks (checklist): all unchecked.

---

## 11. Fine-tuning / Adaptation

**None.** No LoRA/QLoRA, distillation or embedding fine-tuning. *Future work:* a TF-IDF + Logistic Regression baseline, then a multilingual transformer, trained on a leakage-free labelled Bangla/English/Banglish set.

---

## 12. Evaluation & Quality Measurement

**Honest status:** no formal benchmark yet.

What was done:
- Manual functional tests with representative messages: Banglish OTP-phishing → **High risk**; Bangla lottery/fee scam → **High risk**; a bank's "we will never ask for your OTP" notice → **not flagged as fraud** (Needs verification, no false indicators); informational content correctly dampened.
- Verified language handling (English / বাংলা / Banglish detection).
- Verified every highlighted phrase exists in the user's text (hallucinated phrases are discarded).
- Verified graceful fallback when the LLM is unavailable (rule-based result + explicit limitation).

Planned: precision / recall / false-positive rate on a held-out, de-duplicated test set including hard legitimate messages that resemble scams (per blueprint §14.5).

---

## 13. Guardrails, Safety & Privacy

- **Prompt-injection resistance:** message treated as untrusted data in delimiters; instructions inside it ignored.
- **Output validation:** LLM output is checked against a strict schema; invalid output → fallback to rule-based result (never a crash).
- **Anti-hallucination:** highlighted phrases must exist verbatim in the input; LLM cannot invent evidence.
- **No false "Safe":** four outcomes only — High Risk, Suspicious, Needs Verification, No Known Threat Detected. The last is always paired with "not a guarantee of safety". No fake probabilities such as "97% scam".
- **Uncertainty & limits:** every result lists limitations (e.g. sender not independently verified; no threat-intel lookup performed).
- **Harmless-mention handling:** awareness notices that merely mention OTP/PIN are dampened and their keywords are not shown as evidence.
- **Privacy:** scans private by default; UI warns users never to include OTPs/PINs/passwords; community reports labelled "allegation, not proof" and moderated.
- **Abuse controls:** 5,000-character input cap, per-IP rate limit, no secrets in client code.
- **Admin security:** credentials checked server-side only; signed httpOnly cookie; middleware protects `/admin`; constant-time token comparison.
- **Scope limits stated in UI:** no live bKash/Nagad transaction verification, no auto-blocking, no accusations.

---

## 14. Frontend AI / Visual App Builders

- [ ] Lovable · [ ] v0 · [ ] Bolt.new · [ ] Cursor Composer/Agent · [ ] Claude Artifacts · [ ] Gemini Canvas · [ ] ChatGPT Canvas · [ ] Windsurf · [ ] Replit Agent · [ ] Framer AI
- **Other:** **Claude Code** (agentic coding in the Claude desktop app)

**How did you use these tools? What % of UI was AI-built?**
Approximately **100% of the UI code was AI-generated** with Claude Code from a written brief ("modern, premium, calm, real images, real icons, modern motion, Next.js"). The human directed the vision, supplied the blueprint, set requirements (admin login, rebrand to ThreatX AI, real engine) and reported issues; the agent designed the visual system, wrote all components, and verified them in a live browser.

---

## 15. Workflow Automation

**None** (no n8n, Zapier, Make, Airflow, Temporal, Dagster, Prefect, LangGraph, Windmill or Activepieces).

---

## 16. Local / On-device LLMs

**None.** Runtime is a hosted API (OpenAI). *Future option:* a local multilingual classifier for the offline/low-cost tier.

---

## 17. Build a Live `/docs` Module (Recommended)

- [ ] Yes — we will run the `/docs` module prompt and ship a live documentation page

*Decision for you.* If you want this, I can add a `/docs` page (pitch deck + technical whitepaper + architecture + system status) to the app.

---

## 18. Anything else about your AI usage?

- **Hybrid, evidence-first design:** rules + URL analysis + licensed threat-intel (pluggable provider, Google Web Risk implemented, key optional) + contextual LLM + a separate risk engine. No single model decides alone.
- **Localisation by design:** English, বাংলা and Banglish input and bilingual output in one call; UI language toggle.
- **Calm UX as a safety feature:** plain-language explanations, highlighted evidence, one clear next action, and honest limitations.
- **Responsible-AI stance:** refuses to claim authenticity from text alone; never shows invented statistics.

---

## 19. Honest limitations (for judges)

- Link scanning and screenshot analysis are **not yet real**: links use heuristics only; screenshots run in preview mode with sample OCR text.
- No ML classifier, no persistent backend database, no real user accounts (admin login only).
- Community and admin dashboard figures are illustrative.
- No formal accuracy evaluation yet.
- Threat-intel lookups are disabled until a `WEB_RISK_API_KEY` is configured.

## 20. Roadmap

FastAPI analysis service · PostgreSQL · real OCR (Tesseract) for screenshots · licensed threat-intel · labelled Bangla/Banglish dataset + ML baseline · community moderation backend · browser extension · business dashboard & API.
