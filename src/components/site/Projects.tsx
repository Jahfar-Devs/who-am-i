"use client";

/* eslint-disable @next/next/no-img-element -- images come from the admin media library, sizes unknown */
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import type { Content } from "@/lib/default-content";
import { projectSlugs } from "@/lib/slug";
import { EASE, Reveal, SectionLabel, SplitText, useIsDesktop } from "./anim";

type Data = Content["projects"];
export type Project = Data["items"][number];

/** Browser-style frame that tilts toward the pointer. */
export function Frame({ p }: { p: Project }) {
  const rx = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  return (
    <div className="[perspective:1200px]">
      <motion.div
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-ink"
        style={{ rotateX: rx, rotateY: ry }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
        }}
        onMouseLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-line2" />
          <span className="h-2.5 w-2.5 rounded-full bg-line2" />
          <span className="h-2.5 w-2.5 rounded-full bg-line2" />
          <span className="ml-3 truncate font-mono text-xs text-mute">{p.frameLabel}</span>
        </div>
        <div className="group/img relative aspect-[16/10] overflow-hidden bg-panel">
          {p.image ? (
            <img
              src={p.image}
              alt={`${p.title} screenshot`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
            />
          ) : (
            <span className="flex h-full items-center justify-center font-mono text-xs text-mute">{p.frameLabel || p.title}</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Card({
  p,
  i,
  total,
  progress,
  detailLabel,
  href,
}: {
  p: Project;
  i: number;
  total: number;
  progress: MotionValue<number>;
  detailLabel: string;
  href: string;
}) {
  const desktop = useIsDesktop();
  // Earlier cards shrink back as later ones stack on top.
  const scale = useTransform(progress, [i / total, 1], [1, 1 - (total - 1 - i) * 0.045]);

  return (
    <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
      <motion.article
        className="relative grid w-full origin-top gap-8 rounded-3xl border border-line bg-panel p-6 md:p-10 lg:grid-cols-2 lg:gap-12"
        style={desktop ? { scale, top: i * 22 } : undefined}
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <div className="flex flex-col gap-5">
          <p className="flex items-baseline gap-4 font-mono text-[13px] uppercase tracking-[0.08em] text-mute">
            <span className="text-accent">{String(i + 1).padStart(3, "0")}</span>
            {p.kind}
          </p>
          <h3 className="font-display text-[clamp(28px,3.2vw,44px)] font-semibold leading-[1.06] tracking-[-0.03em]">{p.title}</h3>
          <p className="max-w-[520px] leading-relaxed text-soft">{p.summary}</p>
          <dl className="flex flex-wrap gap-x-9 gap-y-4">
            {p.metrics.map((m, j) => (
              <div key={j} className="flex flex-col-reverse gap-1">
                <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">{m.label}</dt>
                <dd className="font-display text-3xl font-semibold tracking-[-0.02em]">{m.value}</dd>
              </div>
            ))}
          </dl>
          <ul className="flex flex-wrap gap-1.5 font-mono text-xs text-soft">
            {p.tags.map((t) => (
              <li key={t} className="rounded-full border border-line px-3 py-1.5">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap items-center gap-5 pt-2">
            <Link href={href} className="btn btn-ghost !min-h-11 text-sm">
              {detailLabel} <span aria-hidden="true">→</span>
            </Link>
            {p.liveUrl && (
              <a href={p.liveUrl} target="_blank" rel="noreferrer" className="py-3 text-sm font-medium underline decoration-line2 underline-offset-4 hover:text-accent">
                Live site ↗
              </a>
            )}
            {p.repoUrl && (
              <a href={p.repoUrl} target="_blank" rel="noreferrer" className="py-3 text-sm font-medium underline decoration-line2 underline-offset-4 hover:text-accent">
                Source ↗
              </a>
            )}
          </div>
        </div>
        <Frame p={p} />
      </motion.article>
    </div>
  );
}

export default function Projects({ data, index }: { data: Data; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const slugs = projectSlugs(data.items);

  return (
    <section id="projects" className="py-24 md:py-32">
      <div className="wrap flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-8">
          <SectionLabel index={index} label={data.label} />
          <h2 className="font-display text-[clamp(44px,8vw,120px)] font-semibold leading-[0.95] tracking-[-0.045em]">
            <SplitText text={data.heading} />
          </h2>
        </div>
        <Reveal>
          <p className="label">
            001 — {String(data.items.length).padStart(3, "0")}
          </p>
        </Reveal>
      </div>

      <div ref={ref} className="wrap mt-12 flex flex-col gap-6 lg:mt-0 lg:gap-0">
        {data.items.map((p, i) => (
          <Card key={i} p={p} i={i} total={data.items.length} progress={scrollYProgress} detailLabel={data.detailLabel} href={`/projects/${slugs[i]}`} />
        ))}
      </div>
    </section>
  );
}
