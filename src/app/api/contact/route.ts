import { randomUUID } from "crypto";
import { clientIp, rateLimit } from "@/lib/auth";
import { readMessages, writeMessages } from "@/lib/store";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  if (!rateLimit(`contact:${await clientIp()}`, 5, 60 * 60 * 1000)) {
    return Response.json({ error: "Too many messages. Please email me instead." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  // Honeypot: real visitors never fill the hidden "website" field.
  if (clean(body?.website, 200)) return Response.json({ ok: true });

  const name = clean(body?.name, 120);
  const email = clean(body?.email, 200);
  const message = clean(body?.message, 5000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Please fill in your name, a valid email and a message." }, { status: 400 });
  }

  const messages = await readMessages();
  messages.unshift({ id: randomUUID(), name, email, message, at: new Date().toISOString(), read: false });
  await writeMessages(messages.slice(0, 500));
  return Response.json({ ok: true });
}
