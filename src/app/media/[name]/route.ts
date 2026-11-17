import path from "path";
import { IMAGE_TYPES, media, SAFE_NAME } from "@/lib/store";

/** Serves images uploaded from the admin panel (stored in the R2 media bucket). */
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const type = IMAGE_TYPES[path.extname(name).toLowerCase()];
  if (!SAFE_NAME.test(name) || !type) return new Response("Not found", { status: 404 });
  const file = await media().get(name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(file.body as unknown as ReadableStream, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
