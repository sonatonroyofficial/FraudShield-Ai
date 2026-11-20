export type RiskLevel = "high" | "suspicious" | "verify" | "none";
export type InputType = "message" | "url" | "image";
export type Bi = { en: string; bn: string };

export interface Indicator {
  name: Bi;
  evidence: string;
  match?: string;
  reason: Bi;
  source: "rules" | "url-rules" | "ocr";
  weight: number;
}

export interface ScanResult {
  scan_id: string;
  status: "completed" | "processing";
  input_type: InputType;
  language: "en" | "bn" | "banglish";
  risk_level: RiskLevel;
  summary: Bi;
  indicators: Indicator[];
  recommended_actions: Bi[];
  limitations: Bi[];
  extracted: { urls: string[]; phones: string[] };
  input_preview: string;
  created_at: string;
  demo_note?: Bi;
  scam_type?: Bi;
  extracted_text?: string;
  explanation?: Bi;
  engine?: { llm: boolean; rules: boolean; threat_intel: boolean };
}

export interface CommunityReport {
  id: string;
  type: "message" | "url" | "phone";
  title: string;
  indicator: string;
  confidence: "low" | "medium" | "high";
  status: "pending" | "approved" | "rejected" | "more-info";
  reports: number;
  category: string;
  updated: string;
}
