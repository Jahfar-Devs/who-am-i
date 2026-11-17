"use client";

/* eslint-disable @next/next/no-img-element -- images come from the admin media library, sizes unknown */
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Content } from "@/lib/default-content";
import { Ambient, ScrollTop } from "./Ambient";
import { EASE, Reveal, SplitText } from "./anim";
import { Footer } from "./Contact";
import Cursor from "./Cursor";
import { Frame, type Project } from "./Projects";
import { Providers, useSite } from "./Providers";

type Shot = Project["gallery"][number];

const pad = (n: number, width = 2) => String(n).padStart(width, "0");
const ARROW = "pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line2 bg-ink/70 text-fg backdrop-blur transition-colors hover:border-accent hover:text-accent";

/** Full-screen viewer for one gallery shot. Arrow keys step through, Escape closes. */
function Lightbox({ shots, at, go, onClose }: { shots: Shot[]; at: number; go: (i: number) => void; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const shot = shots[at];
  const step = (by: number) => go((at + by + shots.length) % shots.length);

  useEffect(() => closeRef.current?.focus(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go((at + 1) % shots.length);
      else if (e.key === "ArrowLeft") go((at - 1 + shots.length) % shots.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [at, shots.length, go, onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={shot.label || "Gallery"}
      data-lenis-prevent
      className="fixed inset-0 z-[90] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button type="button" tabIndex={-1} aria-label="Close gallery" className="absolute inset-0 cursor-default bg-ink/95 backdrop-blur-sm" onClick={onClose} />
      <div className="pointer-events-none relative flex items-center justify-between gap-4 p-4 md:p-6">
        <p className="label min-w-0 truncate">
          <span className="text-accent">{pad(at + 1)}</span> / {pad(shots.length)}
          {shot.label && <span className="text-fg"> — {shot.label}</span>}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className="btn btn-ghost pointer-events-auto !min-h-11 shrink-0 !px-4 font-mono text-xs">
          ESC · CLOSE
        </button>
      </div>
      <div className="pointer-events-none relative flex min-h-0 flex-1 items-center justify-center gap-3 px-4 pb-6 md:gap-6 md:px-6 md:pb-8">
        {shots.length > 1 && (
          <button type="button" aria-label="Previous screen" className={ARROW} onClick={() => step(-1)}>
            ←
          </button>
        )}
        <motion.img
          key={at}
          src={shot.image}
          alt={shot.label}
          className="pointer-events-auto max-h-full min-w-0 max-w-full rounded-xl border border-line object-contain"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: EASE }}
        />
        {shots.length > 1 && (
          <button type="button" aria-label="Next screen" className={ARROW} onClick={() => step(1)}>
            →
          </button>
        )}
      </div>
    </motion.div>
  );
}

function Gallery({ shots, heading, title }: { shots: Shot[]; heading: string; title: string }) {
  const { lock } = useSite();
  const [open, setOpen] = useState<number | null>(null);
  const show = (i: number | null) => {
    setOpen(i);
    lock(i !== null);
  };

  return (
    <section aria-labelledby="gallery-title" className="flex flex-col gap-10 border-t border-line pt-12 md:pt-16">
      <Reveal className="flex flex-col gap-4">
        <p className="label">
          <span className="text-accent">{pad(shots.length)}</span> / {shots.length === 1 ? "screen" : "screens"}
        </p>
        <h2 id="gallery-title" className="font-display text-[clamp(32px,5vw,64px)] font-semibold leading-none tracking-[-0.035em]">
          {heading}
        </h2>
      </Reveal>
      {/* Columns keep each shot at its own proportions, so phone and desktop screens sit together. */}
      <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {shots.map((s, i) => (
          <li key={i} className="mb-6 break-inside-avoid">
            <Reveal delay={(i % 3) * 0.08}>
              <figure className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => show(i)}
                  aria-label={`View ${s.label || `screen ${i + 1}`} full size`}
                  className="group block w-full overflow-hidden rounded-2xl border border-line bg-panel transition-colors hover:border-accent/60"
                >
                  <img src={s.image} alt={s.label || `${title} screen ${i + 1}`} loading="lazy" className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                </button>
                <figcaption className="flex items-baseline gap-3 px-1 font-mono text-[13px] text-soft">
                  <span className="text-accent">{pad(i + 1)}</span>
                  {s.label}
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
      <AnimatePresence>{open !== null && <Lightbox shots={shots} at={open} go={setOpen} onClose={() => show(null)} />}</AnimatePresence>
    </section>
  );
}

/** A project's own page: overview, what was built, and a labelled gallery of the system. */
export default function ProjectPage({ content: c, index }: { content: Content; index: number }) {
  const p = c.projects.items[index];
  const shots = p.gallery.filter((s) => s.image);

  return (
    <Providers loader={false} smooth={c.site.smoothScroll}>
      {c.site.cursor && <Cursor />}
      <Ambient />
      <div className="grain" aria-hidden="true" />
      <header id="top" className="wrap flex items-center justify-between gap-4 py-4">
        <Link href="/" className="group flex items-center gap-3 font-mono text-sm tracking-wide">
          {c.site.logoImage && <img src={c.site.logoImage} alt="" width={40} height={40} className="h-10 w-10 rounded-xl transition-transform duration-500 ease-out group-hover:rotate-[-8deg] group-hover:scale-105" />}
          <span>
            {c.site.logoText}
            <span className="text-accent">{c.site.logoAccent}</span>
          </span>
        </Link>
        <Link href="/#projects" className="btn btn-ghost !min-h-11 !px-5 text-sm">
          <span aria-hidden="true">←</span> All work
        </Link>
      </header>

      <main className="wrap flex flex-col gap-16 overflow-x-clip pb-24 pt-10 md:gap-24 md:pt-16">
        <section className="flex flex-col gap-10 md:gap-14">
          <div className="flex flex-col gap-6">
            <Reveal>
              <p className="label">
                <span className="text-accent">{pad(index + 1, 3)}</span> / {p.kind}
              </p>
            </Reveal>
            <h1 className="font-display text-[clamp(40px,7vw,104px)] font-semibold leading-[0.98] tracking-[-0.04em]">
              <SplitText text={p.title} />
            </h1>
          </div>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-7">
              <Frame p={p} />
            </Reveal>
            <Reveal delay={0.1} className="flex flex-col gap-8 lg:col-span-5">
              <p className="text-lg leading-relaxed text-soft">{p.summary}</p>
              {p.metrics.length > 0 && (
                <dl className="grid grid-cols-3 gap-4 border-y border-line py-6">
                  {p.metrics.map((m, j) => (
                    <div key={j} className="flex flex-col-reverse justify-end gap-1">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">{m.label}</dt>
                      <dd className="font-display text-[clamp(26px,3vw,40px)] font-semibold tracking-[-0.02em]">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {(p.liveUrl || p.repoUrl) && (
                <div className="flex flex-wrap gap-3">
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noreferrer" className="btn btn-accent">
                      Visit live site ↗
                    </a>
                  )}
                  {p.repoUrl && (
                    <a href={p.repoUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                      View source ↗
                    </a>
                  )}
                </div>
              )}
            </Reveal>
          </div>
        </section>

        {(p.highlights.length > 0 || p.tags.length > 0) && (
          <section className="grid gap-12 lg:grid-cols-12">
            {p.highlights.length > 0 && (
              <div className="lg:col-span-8">
                <p className="label mb-5">What I built</p>
                <ul className="flex flex-col">
                  {p.highlights.map((h, j) => (
                    <motion.li
                      key={j}
                      className="flex gap-4 border-t border-line py-4 leading-relaxed text-soft"
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: EASE, delay: j * 0.06 }}
                    >
                      <span className="font-mono text-xs leading-7 text-accent">{pad(j + 1)}</span>
                      {h}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
            {p.tags.length > 0 && (
              <Reveal className="lg:col-span-4">
                <p className="label mb-5">Stack</p>
                <ul className="flex flex-wrap gap-1.5 font-mono text-xs text-soft">
                  {p.tags.map((t) => (
                    <li key={t} className="rounded-full border border-line px-3 py-1.5">
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </section>
        )}

        {shots.length > 0 && <Gallery shots={shots} heading={c.projects.galleryLabel} title={p.title} />}

        <Link href="/#projects" className="btn btn-ghost self-start">
          <span aria-hidden="true">←</span> Back to all work
        </Link>
      </main>
      <Footer data={c.footer} brand={{ text: c.site.logoText, accent: c.site.logoAccent }} />
      <ScrollTop />
    </Providers>
  );
}
