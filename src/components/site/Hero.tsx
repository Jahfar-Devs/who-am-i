"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Content } from "@/lib/default-content";
import { Magnetic, Reveal, Scramble, SplitText, Tilt } from "./anim";
import NetworkCanvas from "./NetworkCanvas";
import { useSite } from "./Providers";

type Hero = Content["hero"];

function RequestLog({ data }: { data: Hero }) {
  const { ready } = useSite();
  const [tick, setTick] = useState(0);
  const lines = data.logLines;
  const rows = Math.min(4, lines.length);

  useEffect(() => {
    if (!ready || lines.length <= rows) return;
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, [ready, lines.length, rows]);

  const visible = Array.from({ length: rows }, (_, i) => ({ ...lines[(tick + i) % lines.length], key: tick + i }));

  return (
    <div className="glow-border overflow-hidden rounded-2xl border border-line bg-panel/85 font-mono text-[13px] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-line px-5 py-3 text-mute">
        <span>{data.logTitle}</span>
        <span className="flex items-center gap-2">
          <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
          live
        </span>
      </div>
      <div className="px-5 py-4">
        <div className="relative overflow-hidden" style={{ height: rows * 28 }}>
          <AnimatePresence initial={false}>
            {visible.map((l, i) => (
              <motion.div
                key={l.key}
                className="absolute inset-x-0 flex h-7 items-center gap-2 whitespace-nowrap text-soft"
                initial={{ opacity: 0, y: (i + 1) * 28 }}
                animate={{ opacity: 1, y: i * 28 }}
                exit={{ opacity: 0, y: (i - 1) * 28 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="w-12 text-accent">{l.method}</span>
                <span className="truncate">{l.path}</span>
                <span className="ml-auto text-mute">{l.meta}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <p className="mt-2 text-mute">
          <span className="caret text-accent">▍</span> {data.logFooter}
        </p>
      </div>
    </div>
  );
}

/** Spinning ring of text with a bouncing arrow in the middle. */
function SpinBadge({ text }: { text: string }) {
  const unit = `${text} ✳ `;
  const ring = unit.repeat(Math.max(1, Math.round(40 / unit.length)));
  return (
    <div aria-hidden="true" className="relative h-[136px] w-[136px]">
      <svg viewBox="0 0 136 136" className="spin-slow h-full w-full">
        <defs>
          <path id="hero-ring" d="M68,68 m-54,0 a54,54 0 1,1 108,0 a54,54 0 1,1 -108,0" />
        </defs>
        <text className="fill-mute font-mono text-[10.5px] uppercase">
          <textPath href="#hero-ring" textLength={332} lengthAdjust="spacing">
            {ring}
          </textPath>
        </text>
      </svg>
      <motion.span className="absolute inset-0 flex items-center justify-center text-2xl text-accent" animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
        ↓
      </motion.span>
    </div>
  );
}

export default function Hero({ data }: { data: Hero }) {
  const { ready } = useSite();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-10 pt-32">
      <NetworkCanvas />
      {data.scrollHint && (
        <div className="wrap pointer-events-none absolute inset-x-0 top-28 hidden justify-end lg:flex">
          <Reveal active={ready} delay={1.2} y={0}>
            <SpinBadge text={data.scrollHint} />
          </Reveal>
        </div>
      )}
      <motion.div className="wrap relative flex origin-bottom flex-col gap-10" style={{ y, opacity, scale }}>
        <Reveal active={ready} delay={0.5} y={12}>
          <p className="label flex items-center gap-3">
            <span className="pulse-dot h-2 w-2 shrink-0 rounded-full bg-accent" />
            <Scramble text={data.status} active={ready} />
          </p>
        </Reveal>

        <h1 className="font-display text-[clamp(44px,14.2vw,max(56px,min(13vw,188px)))] font-bold uppercase leading-[0.88] tracking-[-0.045em]">
          <SplitText text={data.firstLine} by="letter" active={ready} delay={0.15} className="block" />
          <span className="block">
            <SplitText text={data.outlineWord} by="letter" active={ready} delay={0.35} className="outline-text" />{" "}
            <SplitText text={data.lastWord} by="letter" active={ready} delay={0.6} />
            <motion.span
              className="inline-block text-accent"
              initial={{ scale: 0 }}
              animate={ready ? { scale: 1 } : undefined}
              transition={{ type: "spring", stiffness: 300, damping: 12, delay: 1 }}
            >
              .
            </motion.span>
          </span>
        </h1>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <Reveal active={ready} delay={0.8} className="flex max-w-[540px] flex-col gap-7">
            <p className="text-lg leading-relaxed text-soft md:text-xl">{data.tagline}</p>
            <div className="flex flex-wrap gap-3">
              {data.primaryLabel && (
                <Magnetic>
                  <a href={data.primaryHref} className="btn btn-accent">
                    {data.primaryLabel}
                    <span aria-hidden="true">↓</span>
                  </a>
                </Magnetic>
              )}
              {data.secondaryLabel && (
                <Magnetic>
                  <a href={data.secondaryHref} className="btn btn-ghost">
                    {data.secondaryLabel}
                  </a>
                </Magnetic>
              )}
            </div>
          </Reveal>
          <Reveal active={ready} delay={0.95} className="w-full lg:max-w-[460px]">
            <Tilt>
              <RequestLog data={data} />
            </Tilt>
          </Reveal>
        </div>

        <Reveal active={ready} delay={1.2} y={0} className="lg:hidden">
          <p className="label flex items-center gap-3 border-t border-line pt-5">
            <motion.span aria-hidden="true" animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
              ↓
            </motion.span>
            {data.scrollHint}
          </p>
        </Reveal>
      </motion.div>
    </section>
  );
}
