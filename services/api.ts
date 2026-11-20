import { runAnalysis } from "@/lib/analyze";
import { saveScan, getScan, loadScans, deleteScan } from "@/lib/store";
import type { InputType, ScanResult } from "@/types";

/* Single place for backend calls. All three scan types hit a real server route
   (rules + threat intel + LLM; screenshots are read with vision OCR).
   Messages and links fall back to the local rule engine if the server is unreachable;
   screenshots never fall back to fake data — the user gets an honest error instead. */

export class ScanError extends Error {}

async function post(path: string, body: unknown): Promise<ScanResult> {
  const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new ScanError(d.error || "The scan failed. Please try again.");
  return d as ScanResult;
}

/** Downscale to max 1600px JPEG: faster upload, fewer vision tokens. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 1600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      const ctx = c.getContext("2d");
      if (!ctx) return reject(new ScanError("Could not process the image."));
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new ScanError("Could not open that image.")); };
    img.src = url;
  });
}

export async function submitScan(input: string | File, type: InputType): Promise<ScanResult> {
  let result: ScanResult;
  if (type === "image") {
    result = await post("/api/scan/image", { image: await fileToDataUrl(input as File) });
  } else {
    const text = input as string;
    try {
      result = await post(type === "url" ? "/api/scan/url" : "/api/scan/message", type === "url" ? { url: text } : { text });
    } catch (e) {
      if (e instanceof ScanError) throw e; // validation / rate-limit errors are shown to the user
      result = runAnalysis(text, type);    // network failure → local rules still give a real (basic) result
    }
  }
  saveScan(result);
  return result;
}
export const fetchScan = async (id: string) => getScan(id);
export const fetchScans = async () => loadScans();
export const removeScan = async (id: string) => deleteScan(id);
