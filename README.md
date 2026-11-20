# ThreatX AI — Frontend

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion + Lucide icons.

```
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Pages
`/` landing · `/scanner` · `/result/[scanId]` · `/community` · `/dashboard` · `/admin` · `/about` · `/login`

## Notes
- `services/api.ts` is the single backend gateway. It currently calls a client-side demo engine (`lib/analyze.ts`) and stores scans in `localStorage`. Replace the function bodies with `fetch` calls to the FastAPI `/api/v1/*` endpoints when the backend is ready.
- Screenshot analysis is a preview: no image is uploaded, and a sample OCR text is analysed.
- Community and admin data are illustrative placeholders.
- Language toggle (English / বাংলা) covers navigation, hero, scanner and result chrome.
