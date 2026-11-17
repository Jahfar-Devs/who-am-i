import { promises as fs } from "fs";
import path from "path";
import { IMAGE_TYPES, SAFE_NAME, UPLOAD_DIR } from "@/lib/store";

/** Serves images uploaded from the admin panel (stored in ./data/uploads). */
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const type = IMAGE_TYPES[path.extname(name).toLowerCase()];
  if (!SAFE_NAME.test(name) || !type) return new Response("Not found", { status: 404 });
  try {
    const file = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
