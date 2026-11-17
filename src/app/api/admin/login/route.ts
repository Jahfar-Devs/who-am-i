import { cookies } from "next/headers";
import {
  adminConfigured,
  checkPassword,
  clientIp,
  createSessionToken,
  rateLimit,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return Response.json(
      { error: "Admin is not configured. Set ADMIN_PASSWORD in .env.local and restart." },
      { status: 503 },
    );
  }
  if (!rateLimit(`login:${await clientIp()}`, 8, 10 * 60 * 1000)) {
    return Response.json({ error: "Too many attempts. Try again in 10 minutes." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  if (typeof body?.password !== "string" || !checkPassword(body.password)) {
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }
  (await cookies()).set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
  return Response.json({ ok: true });
}
