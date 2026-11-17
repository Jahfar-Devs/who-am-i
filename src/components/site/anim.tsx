"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;
const VIEW = { once: true, margin: "-10% 0px" } as const;

/** Fade + rise when scrolled into view (or when `active` flips true). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  active,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  active?: boolean;
}) {
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };
  const trigger =
    active === undefined ? { whileInView: shown, viewport: VIEW } : { animate: active ? shown : undefined };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...trigger}
    >
      {children}
    </motion.div>
  );
}

const rise = {
  hidden: { y: "115%" },
  show: { y: "0%", transition: { duration: 0.9, ease: EASE } },
};

/** Masked text reveal: each word (or letter) rises from behind a clip. */
export function SplitText({
  text,
  className,
  by = "word",
  delay = 0,
  stagger,
  active,
}: {
  text: string;
  className?: string;
  by?: "word" | "letter";
  delay?: number;
  stagger?: number;
  active?: boolean;
}) {
  const parts = by === "word" ? text.split(" ") : Array.from(text);
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: stagger ?? (by === "word" ? 0.06 : 0.035), delayChildren: delay } },
  };
  const trigger =
    active === undefined
      ? { whileInView: "show", viewport: VIEW }
      : { animate: active ? "show" : "hidden" };
  return (
    <motion.span className={className} variants={container} initial="hidden" {...trigger}>
      {parts.map((part, i) => (
        <span key={i}>
          <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
            <motion.span className="inline-block" variants={rise}>
              {part === " " ? " " : part}
            </motion.span>
          </span>
          {by === "word" && i < parts.length - 1 ? " " : null}
        </span>
      ))}
    </motion.span>
  );
}

function ScrollWord({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}

/** Words light up one by one as the block scrolls through the viewport. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "end 55%"] });
  const words = text.split(" ");
  return (
    <span ref={ref} className={`block ${className ?? ""}`}>
      {words.map((w, i) => (
        <ScrollWord key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </ScrollWord>
      ))}
    </span>
  );
}

/** Pulls its child toward the pointer. */
export function Magnetic({ children, strength = 0.3, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 220, damping: 16, mass: 0.4 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  return (
    <motion.span
      className={`inline-block ${className ?? ""}`}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/** Counts up to a value like "1,800+" or "2+" when it enters the viewport. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, VIEW);
  useEffect(() => {
    const node = ref.current;
    const m = value.match(/^(\D*)(\d[\d,]*\.?\d*)(.*)$/);
    if (!inView || !node || !m) return;
    const target = parseFloat(m[2].replace(/,/g, ""));
    const decimals = (m[2].split(".")[1] ?? "").length;
    const controls = animate(0, target, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => {
        const n = Number(v.toFixed(decimals));
        node.textContent = m[1] + (m[2].includes(",") ? n.toLocaleString("en-US") : n.toFixed(decimals)) + m[3];
      },
    });
    return () => controls.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}

export function SectionLabel({ index, label }: { index: number; label: string }) {
  return (
    <Reveal>
      <p className="label flex items-center gap-4">
        <span>
          <span className="text-accent">{String(index).padStart(2, "0")}</span> / <Scramble text={label} />
        </span>
        <motion.span
          aria-hidden="true"
          className="h-px w-24 origin-left bg-line2"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={VIEW}
          transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
        />
      </p>
    </Reveal>
  );
}

const GLYPHS = "<>/\\[]{}=+*#_-";

/** Text that decodes from random glyphs into place when it scrolls into view. */
export function Scramble({ text, active = true, className }: { text: string; active?: boolean; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, VIEW);
  useEffect(() => {
    const node = ref.current;
    if (!node || !active || !inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = Array.from(text);
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      const solved = Math.floor(frame * 0.9);
      node.textContent = chars.map((ch, i) => (i < solved || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("");
      if (solved >= chars.length) clearInterval(id);
    }, 28);
    return () => {
      clearInterval(id);
      node.textContent = text;
    };
  }, [text, active, inView]);
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text}
      </span>
    </span>
  );
}

/** Tilts its child in 3D toward the pointer. */
export function Tilt({ children, className, max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const spring = { stiffness: 160, damping: 18, mass: 0.5 };
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);
  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 2 * max);
        rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * max);
      }}
      onMouseLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}
