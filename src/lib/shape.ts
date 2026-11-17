import { defaultContent, SECTION_IDS, type Content } from "./default-content";

/** An empty value with the same shape as `template` (used for "add item"). */
export function blankOf<T>(template: T): T {
  if (Array.isArray(template)) return [] as T;
  if (template !== null && typeof template === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(template)) out[k] = blankOf(v);
    return out as T;
  }
  if (typeof template === "string") return "" as T;
  if (typeof template === "number") return 0 as T;
  if (typeof template === "boolean") return false as T;
  return template;
}

/**
 * Force `value` into the shape of `template`, so content saved or imported
 * from the admin panel can never crash the public page.
 */
function conform<T>(value: unknown, template: T, blank = false): T {
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return (blank ? [] : template) as T;
    const item = template[0];
    if (item === undefined) return value as T;
    return value.filter((v) => v != null).map((v) => conform(v, item, true)) as T;
  }
  if (template !== null && typeof template === "object") {
    const src =
      value !== null && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
    const out: Record<string, unknown> = {};
    for (const [k, t] of Object.entries(template)) out[k] = conform(src[k], t, blank);
    return out as T;
  }
  if (typeof value === typeof template) return value as T;
  return blank ? blankOf(template) : template;
}

export function normalizeContent(input: unknown): Content {
  const c = conform(input, defaultContent);
  if (!/^#[0-9a-fA-F]{6}$/.test(c.site.accent)) c.site.accent = defaultContent.site.accent;
  // Keep only known section ids, once each, and append any that are missing.
  const known = new Set<string>(SECTION_IDS);
  const seen = new Set<string>();
  c.layout = c.layout.filter((id) => known.has(id) && !seen.has(id) && seen.add(id));
  for (const id of SECTION_IDS) if (!seen.has(id)) c.layout.push(id);
  return c;
}
