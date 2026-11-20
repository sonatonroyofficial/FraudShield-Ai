import { runAnalysis } from "@/lib/analyze";
import { saveScan, getScan, loadScans, deleteScan } from "@/lib/store";
import type { InputType, ScanResult } from "@/types";

/* Single place for backend calls. Swap the bodies for fetch() calls to
   NEXT_PUBLIC_API_URL (/api/v1/scans/...) when the FastAPI service is live. */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function submitScan(input: string, type: InputType): Promise<ScanResult> {
  await delay(type === "image" ? 2800 : 2200); // lets the calm "analysing" state breathe
  const result = runAnalysis(input, type);
  saveScan(result);
  return result;
}
export const fetchScan = async (id: string) => getScan(id);
export const fetchScans = async () => loadScans();
export const removeScan = async (id: string) => deleteScan(id);
