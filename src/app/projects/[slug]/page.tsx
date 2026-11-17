import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectPage from "@/components/site/ProjectPage";
import { projectSlugs } from "@/lib/slug";
import { getContent } from "@/lib/store";

async function find(slug: string) {
  const content = await getContent();
  const index = content.projects.visible ? projectSlugs(content.projects.items).indexOf(slug) : -1;
  return { content, index };
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { content, index } = await find((await params).slug);
  const p = content.projects.items[index];
  return p ? { title: `${p.title} — ${content.site.name}`, description: p.summary } : {};
}

export default async function Page({ params }: PageProps<"/projects/[slug]">) {
  const { content, index } = await find((await params).slug);
  if (index < 0) notFound();
  return <ProjectPage content={content} index={index} />;
}
