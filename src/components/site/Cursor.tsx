"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/** Accent dot + trailing ring that grows over links and buttons. Fine pointers only. */
export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dotX = useSpring(x, { stiffness: 900, damping: 50, mass: 0.3 });
  const dotY = useSpring(y, { stiffness: 900, damping: 50, mass: 0.3 });
  const ringX = useSpring(x, { stiffness: 220, damping: 24, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 220, damping: 24, mass: 0.6 });
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: MouseEvent) => {
      setEnabled(true);
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) =>
      setHover(Boolean((e.target as Element | null)?.closest?.("a, button, [data-cursor]")));
    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <div aria-hidden="true">
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[80] -ml-1 -mt-1 h-2 w-2 rounded-full bg-accent"
        style={{ x: dotX, y: dotY }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[80] -ml-5 -mt-5 h-10 w-10 rounded-full border border-fg/50"
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hover ? 1.7 : 1, opacity: hover ? 1 : 0.5 }}
        transition={{ duration: 0.25 }}
      />
    </div>
  );
}
