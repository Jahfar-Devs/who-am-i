import { promises as fs } from "fs";
import path from "path";
import { isAuthed, unauthorized } from "@/lib/auth";
import { IMAGE_TYPES, listMedia, SAFE_NAME, UPLOAD_DIR } from "@/lib/store";

const MAX_BYTES = 8 * 1024 * 1024;

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  return Response.json({ items: await listMedia() });
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File);
  if (!files.length) return Response.json({ error: "No files received" }, { status: 400 });

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const saved: string[] = [];
  const rejected: string[] = [];
  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    if (!(ext in IMAGE_TYPES) || file.size > MAX_BYTES || file.size === 0) {
      rejected.push(file.name);
      continue;
    }
    const base =
      path
        .basename(file.name, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "image";
    const name = `${Date.now().toString(36)}-${base}${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
    saved.push(`/media/${name}`);
  }
  return Response.json({ saved, rejected, items: await listMedia() });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const name = new URL(req.url).searchParams.get("name") ?? "";
  if (!SAFE_NAME.test(name)) return Response.json({ error: "Bad file name" }, { status: 400 });
  await fs.rm(path.join(UPLOAD_DIR, name), { force: true });
  return Response.json({ items: await listMedia() });
}
