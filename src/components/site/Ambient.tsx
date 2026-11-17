"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

/** Fixed backdrop: two drifting accent glows and a soft light that follows the pointer. */
export function Ambient() {
  const x = useMotionValue(-600);
  const y = useMotionValue(-600);
  const spring = { stiffness: 60, damping: 20, mass: 0.6 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: MouseEvent) => {
      x.set(e.clientX - 300);
      y.set(e.clientY - 300);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="aurora-a absolute -left-[10vw] top-[8vh] h-[46vw] max-h-[620px] w-[46vw] max-w-[620px] rounded-full bg-accent/[0.07] blur-[120px]" />
      <div className="aurora-b absolute -right-[8vw] bottom-[4vh] h-[40vw] max-h-[560px] w-[40vw] max-w-[560px] rounded-full bg-accent/[0.05] blur-[130px]" />
      <motion.div
        className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full"
        style={{ x: sx, y: sy, background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 9%, transparent), transparent 65%)" }}
      />
    </div>
  );
}

/** Back-to-top button whose ring fills with the scroll position. */
export function ScrollTop() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.08, 0.16], [0, 1]);
  const pointerEvents = useTransform(scrollYProgress, (v) => (v > 0.1 ? "auto" : "none"));
  return (
    <motion.a
      href="#top"
      aria-label="Back to top"
      className="group fixed bottom-6 right-6 z-40 hidden h-12 w-12 items-center justify-center rounded-full bg-panel/80 text-fg backdrop-blur transition-colors hover:text-accent md:flex"
      style={{ opacity, pointerEvents }}
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="22.5" stroke="var(--color-line2)" strokeWidth="1.5" />
        <motion.circle cx="24" cy="24" r="22.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" style={{ pathLength: scrollYProgress }} />
      </svg>
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5">
        ↑
      </span>
    </motion.a>
  );
}
