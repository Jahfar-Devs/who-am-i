import { isAuthed, unauthorized } from "@/lib/auth";
import { deleteMessage, readMessages, setMessageRead } from "@/lib/store";

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  return Response.json({ messages: await readMessages() });
}

/** Mark one message read/unread. */
export async function PATCH(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const body = (await req.json().catch(() => null)) as { id?: string; read?: boolean } | null;
  if (body?.id) await setMessageRead(body.id, Boolean(body.read));
  return Response.json({ messages: await readMessages() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  if (id) await deleteMessage(id);
  return Response.json({ messages: await readMessages() });
}
