import { promises as fs } from "fs";
import path from "path";
import { cacheLife, cacheTag } from "next/cache";
import { defaultContent, type Content } from "./default-content";
import { normalizeContent } from "./shape";

// File-based storage: content, messages and uploads live in ./data so the
// site needs no database. Requires a host with a writable disk (VPS, Hostinger
// Node hosting, DigitalOcean); serverless hosts need a database/blob swap here.
export const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

export const CONTENT_TAG = "content";

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tmp, file);
}

/** Fresh read, used by the admin API. */
export async function readContent(): Promise<Content> {
  return normalizeContent(await readJson<unknown>(CONTENT_FILE, defaultContent));
}

/** Cached read for the public site; invalidated when the admin saves. */
export async function getContent(): Promise<Content> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  return readContent();
}

export async function writeContent(input: unknown): Promise<Content> {
  const content = normalizeContent(input);
  await writeJson(CONTENT_FILE, content);
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
  const list = await readJson<Message[]>(MESSAGES_FILE, []);
  return Array.isArray(list) ? list : [];
}

export async function writeMessages(list: Message[]) {
  await writeJson(MESSAGES_FILE, list);
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
  let names: string[] = [];
  try {
    names = await fs.readdir(UPLOAD_DIR);
  } catch {
    return [];
  }
  const items = await Promise.all(
    names
      .filter((n) => SAFE_NAME.test(n) && path.extname(n).toLowerCase() in IMAGE_TYPES)
      .map(async (name) => {
        const stat = await fs.stat(path.join(UPLOAD_DIR, name));
        return { name, url: `/media/${name}`, size: stat.size, at: stat.mtime.toISOString() };
      }),
  );
  return items.sort((a, b) => b.at.localeCompare(a.at));
}
