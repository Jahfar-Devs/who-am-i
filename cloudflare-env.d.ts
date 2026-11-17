// Bindings declared in wrangler.jsonc. Written by hand (not `wrangler types`) so
// the Workers runtime types do not override the DOM types used by client code.
interface CloudflareEnv {
  DB: import("@cloudflare/workers-types").D1Database;
  MEDIA: import("@cloudflare/workers-types").R2Bucket;
}
