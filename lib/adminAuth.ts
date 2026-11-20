export const COOKIE = "fs_admin";

async function hmac(message: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function makeToken(email: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  return `${email}.${await hmac("admin:" + email, secret)}`;
}

export async function verifyToken(token?: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!token || !secret) return false;
  const i = token.lastIndexOf(".");
  if (i < 1) return false;
  const email = token.slice(0, i);
  const expected = await hmac("admin:" + email, secret);
  const given = token.slice(i + 1);
  if (expected.length !== given.length) return false;
  let diff = 0;
  for (let k = 0; k < expected.length; k++) diff |= expected.charCodeAt(k) ^ given.charCodeAt(k);
  return diff === 0 && email === process.env.ADMIN_EMAIL;
}
