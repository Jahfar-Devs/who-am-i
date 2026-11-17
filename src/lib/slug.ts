/** URL slugs for project titles: lowercase, hyphenated, unique ("-2" on a repeated title). */
export function projectSlugs(items: { title: string }[]): string[] {
  const seen = new Map<string, number>();
  return items.map((p, i) => {
    const base = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `project-${i + 1}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}
