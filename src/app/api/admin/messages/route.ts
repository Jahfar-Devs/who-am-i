import { isAuthed, unauthorized } from "@/lib/auth";
import { readMessages, writeMessages } from "@/lib/store";

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  return Response.json({ messages: await readMessages() });
}

/** Mark one message read/unread. */
export async function PATCH(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const body = (await req.json().catch(() => null)) as { id?: string; read?: boolean } | null;
  const messages = (await readMessages()).map((m) =>
    m.id === body?.id ? { ...m, read: Boolean(body.read) } : m,
  );
  await writeMessages(messages);
  return Response.json({ messages });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  const messages = (await readMessages()).filter((m) => m.id !== id);
  await writeMessages(messages);
  return Response.json({ messages });
}
