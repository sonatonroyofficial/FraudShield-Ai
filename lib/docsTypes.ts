export type SectionType = "rich" | "features" | "mermaid" | "team" | "live" | "changelog";
export interface DocSection {
  id: string; title: string; group: "pitch" | "tech"; type: SectionType; visible: boolean;
  html?: string; mermaid?: string; caption?: string;
}
export interface TeamMember { id: string; name: string; role: string; email: string; photo?: string }
export interface ChangelogEntry { version: string; date: string; notes: string[] }
export interface DocsContent {
  title: string; tagline: string; sections: DocSection[];
  team: { name: string; members: TeamMember[] }; changelog: ChangelogEntry[];
}
export interface DocsAccess { visible: boolean; scheduleEnabled: boolean; start: string; end: string }
export interface DocsVersion { id: string; at: string; label: string; content: DocsContent }
export interface DocsRecord {
  access: DocsAccess; draft: DocsContent; published: DocsContent;
  versions: DocsVersion[]; updated_at: string; published_at: string | null;
}
export type AccessReason = "open" | "off" | "upcoming" | "ended";

export type FeatureStatus = "live" | "degraded" | "upcoming" | "planned";
export interface FeatureRow { id: string; name: string; desc: string; status: FeatureStatus; note?: string }
export interface LiveSnapshot {
  generated_at: string;
  engine: { llm: boolean; threat_intel: boolean; db: boolean; vision: boolean };
  scans: { total: number; week: number; today: number; risk: Record<string, number>; series: number[] } | null;
  reports: { approved: number } | null;
  features: FeatureRow[];
}
