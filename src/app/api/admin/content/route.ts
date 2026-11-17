import { revalidateTag } from "next/cache";
import { isAuthed, unauthorized } from "@/lib/auth";
import { defaultContent } from "@/lib/default-content";
import { CONTENT_TAG, readContent, writeContent } from "@/lib/store";

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  return Response.json({ content: await readContent() });
}

async function save(input: unknown) {
  const content = await writeContent(input);
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ content });
}

export async function PUT(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const text = await req.text();
  if (text.length > 2_000_000) return Response.json({ error: "Content is too large" }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Content must be an object" }, { status: 400 });
  }
  return save(body);
}

/** Reset everything to the seed content. */
export async function DELETE() {
  if (!(await isAuthed())) return unauthorized();
  return save(defaultContent);
}
