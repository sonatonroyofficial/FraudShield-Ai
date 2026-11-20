import type { CommunityReport, ScanResult } from "@/types";

const KEY = "fs.scans.v1";
const RKEY = "fs.reports.v1";
const safe = <T,>(fn: () => T, fb: T): T => { try { return fn(); } catch { return fb; } };

export const loadScans = (): ScanResult[] => safe(() => JSON.parse(localStorage.getItem(KEY) || "[]"), []);
export const saveScan = (s: ScanResult) => safe(() => localStorage.setItem(KEY, JSON.stringify([s, ...loadScans()].slice(0, 50))), undefined);
export const getScan = (id: string) => loadScans().find((s) => s.scan_id === id) ?? null;
export const deleteScan = (id: string) => safe(() => localStorage.setItem(KEY, JSON.stringify(loadScans().filter((s) => s.scan_id !== id))), undefined);

export const loadReports = (): CommunityReport[] => safe(() => JSON.parse(localStorage.getItem(RKEY) || "[]"), []);
export const saveReport = (r: CommunityReport) => safe(() => localStorage.setItem(RKEY, JSON.stringify([r, ...loadReports()])), undefined);
