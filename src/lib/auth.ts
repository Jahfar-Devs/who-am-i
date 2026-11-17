import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";

export const SESSION_COOKIE = "jsk_admin";
const SESSION_HOURS = 12;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function mac(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string) {
  const real = process.env.ADMIN_PASSWORD;
  return Boolean(real) && safeEqual(input, real as string);
}

export function createSessionToken() {
  const exp = String(Date.now() + SESSION_HOURS * 3600 * 1000);
  return `${exp}.${mac(exp)}`;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_HOURS * 3600,
};

export async function isAuthed() {
  if (!secret()) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !safeEqual(sig, mac(exp))) return false;
  return Number(exp) > Date.now();
}

export function unauthorized() {
  return Response.json({ error: "Not signed in" }, { status: 401 });
}

export async function clientIp() {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local"
  );
}

// Small in-memory limiter: enough for a single-instance portfolio.
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= max;
}
