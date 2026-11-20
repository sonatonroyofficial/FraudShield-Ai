/* Provider-independent threat-intelligence interface (blueprint §9.4).
   Implemented with Google Web Risk when WEB_RISK_API_KEY is set. */
export interface ThreatFinding { url: string; matches: string[] }
export interface ThreatResult { checked: boolean; findings: ThreatFinding[] }

export async function checkUrls(urls: string[]): Promise<ThreatResult> {
  const key = process.env.WEB_RISK_API_KEY;
  if (!key || urls.length === 0) return { checked: false, findings: [] };
  const findings: ThreatFinding[] = [];
  let checked = false;
  for (const raw of urls.slice(0, 3)) {
    const uri = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
    try {
      const q = new URLSearchParams({ uri, key });
      for (const t of ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"]) q.append("threatTypes", t);
      const r = await fetch(`https://webrisk.googleapis.com/v1/uris:search?${q}`, { signal: AbortSignal.timeout(5000) });
      if (!r.ok) continue;
      checked = true;
      const j = await r.json();
      if (j?.threat?.threatTypes?.length) findings.push({ url: raw, matches: j.threat.threatTypes });
    } catch { /* provider unavailable — reported as a limitation */ }
  }
  return { checked, findings };
}
