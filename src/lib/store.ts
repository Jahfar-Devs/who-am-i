import path from "path";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { defaultContent, type Content } from "./default-content";
import { normalizeContent } from "./shape";

// Cloudflare storage: content and messages live in D1 (binding DB), uploads in
// R2 (binding MEDIA). Bindings are declared in wrangler.jsonc.
const db = () => getCloudflareContext().env.DB;
export const media = () => getCloudflareContext().env.MEDIA;

/** Fresh read, used by the admin API. Falls back to the seed content until the first save. */
export async function readContent(): Promise<Content> {
  const row = await db().prepare("SELECT json FROM content WHERE id = 1").first<{ json: string }>();
  let raw: unknown = defaultContent;
  try {
    if (row) raw = JSON.parse(row.json);
  } catch {}
  return normalizeContent(raw);
}

/** Read for the public site, deduplicated within one request. */
export const getContent = cache(readContent);

export async function writeContent(input: unknown): Promise<Content> {
  const content = normalizeContent(input);
  await db()
    .prepare("INSERT INTO content (id, json) VALUES (1, ?1) ON CONFLICT (id) DO UPDATE SET json = excluded.json")
    .bind(JSON.stringify(content))
    .run();
  return content;
}

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  at: string;
  read: boolean;
};

export async function readMessages(): Promise<Message[]> {
  const { results } = await db()
    .prepare("SELECT id, name, email, message, at, read FROM messages ORDER BY at DESC")
    .all<Omit<Message, "read"> & { read: number }>();
  return results.map((m) => ({ ...m, read: Boolean(m.read) }));
}

/** Stores a message and keeps only the newest 500. */
export async function addMessage(m: Message) {
  await db().batch([
    db()
      .prepare("INSERT INTO messages (id, name, email, message, at, read) VALUES (?1, ?2, ?3, ?4, ?5, ?6)")
      .bind(m.id, m.name, m.email, m.message, m.at, m.read ? 1 : 0),
    db().prepare("DELETE FROM messages WHERE id NOT IN (SELECT id FROM messages ORDER BY at DESC LIMIT 500)"),
  ]);
}

export async function setMessageRead(id: string, read: boolean) {
  await db().prepare("UPDATE messages SET read = ?1 WHERE id = ?2").bind(read ? 1 : 0, id).run();
}

export async function deleteMessage(id: string) {
  await db().prepare("DELETE FROM messages WHERE id = ?1").bind(id).run();
}

/** Upload types the admin accepts (images, plus PDF for the CV). */
export const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
};

export const SAFE_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,120}$/;

export type MediaItem = { name: string; url: string; size: number; at: string };

export async function listMedia(): Promise<MediaItem[]> {
  const items: MediaItem[] = [];
  let cursor: string | undefined;
  do {
    const page = await media().list({ cursor });
    for (const o of page.objects) {
      if (SAFE_NAME.test(o.key) && path.extname(o.key).toLowerCase() in IMAGE_TYPES) {
        items.push({ name: o.key, url: `/media/${o.key}`, size: o.size, at: o.uploaded.toISOString() });
      }
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return items.sort((a, b) => b.at.localeCompare(a.at));
}
