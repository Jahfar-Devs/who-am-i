"use client";

import { animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { Content } from "@/lib/default-content";
import { useSite } from "./Providers";

const CURTAIN = [0.76, 0, 0.24, 1] as const;

/** Boot-sequence loading screen: log lines tick off while a counter runs to 100, then the screen lifts. */
export default function Preloader({ data }: { data: Content["loader"] }) {
  const { setReady } = useSite();
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const controls = animate(0, 100, {
      duration: reduce ? 0.3 : Math.max(0.8, data.durationMs / 1000),
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setPct(Math.round(v)),
      onComplete: () => {
        timer = setTimeout(() => {
          setLeaving(true);
          setReady(true);
        }, 350);
      },
    });
    return () => {
      controls.stop();
      clearTimeout(timer);
    };
  }, [data.durationMs, reduce, setReady]);

  if (gone) return null;

  const done = Math.min(data.lines.length, Math.floor((pct / 100) * (data.lines.length + 1)));
  const exit = leaving ? { y: "-100%" } : { y: "0%" };

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 z-[99] bg-accent"
        initial={false}
        animate={exit}
        transition={{ duration: 1, ease: CURTAIN, delay: 0.12 }}
        onAnimationComplete={() => leaving && setGone(true)}
      />
      <motion.div
        role="status"
        aria-label="Loading"
        className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink p-6 font-mono md:p-12"
        initial={false}
        animate={exit}
        transition={{ duration: 1, ease: CURTAIN }}
      >
        <div className="label flex justify-between gap-4">
          <span>{data.topLeft}</span>
          <span className="hidden sm:inline">{data.topRight}</span>
        </div>

        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <ul className="flex min-h-[170px] flex-col gap-2.5 text-[13px] leading-relaxed text-mute md:text-[15px]">
            {data.lines.map((line, i) =>
              i < done ? (
                <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
                  <span className="text-accent">✓</span> {line.text} <span className="text-soft">{line.detail}</span>
                </motion.li>
              ) : i === done ? (
                <li key={i} className="text-fg">
                  <span className="caret">▍</span> {line.text}
                </li>
              ) : null,
            )}
            {done >= data.lines.length && (
              <li className="text-fg">
                <span className="caret">▍</span> {data.finalLine}
              </li>
            )}
          </ul>
          <div className="font-display text-[clamp(120px,30vw,340px)] font-bold leading-[0.8] tracking-[-0.06em] tabular-nums">
            {pct}
            <span className="text-[0.28em] tracking-normal text-accent">%</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="h-0.5 bg-line">
            <div className="h-0.5 origin-left bg-accent" style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
          <div className="label flex justify-between gap-4">
            <span>{data.footer}</span>
            <span>{pct < 100 ? "LOADING" : "READY"}</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
