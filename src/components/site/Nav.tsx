"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import type { Content } from "@/lib/default-content";
import { EASE } from "./anim";
import { useSite } from "./Providers";

export default function Nav({ site, nav }: { site: Content["site"]; nav: Content["nav"] }) {
  const { ready, lock } = useSite();
  const { scrollY, scrollYProgress } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  // Hide on scroll down, show on scroll up.
  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(v > prev && v > 240);
  });

  // Highlight the link whose section is in the middle of the viewport.
  useEffect(() => {
    const targets = nav.links
      .map((l) => (l.href.startsWith("#") ? document.getElementById(l.href.slice(1)) : null))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [nav.links]);

  const toggle = (next: boolean) => {
    setOpen(next);
    lock(next);
  };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={{ y: "-110%" }}
        animate={{ y: ready && (!hidden || open) ? "0%" : "-110%" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <motion.div className="h-0.5 origin-left bg-accent" style={{ scaleX: scrollYProgress }} />
        <div className="wrap flex items-center justify-between gap-4 py-4">
          <a href="#top" className="group flex items-center gap-3 font-mono text-sm tracking-wide" onClick={() => toggle(false)}>
            {site.logoImage && (
              // eslint-disable-next-line @next/next/no-img-element -- logo comes from the admin media library
              <img src={site.logoImage} alt="" width={40} height={40} className="h-10 w-10 rounded-xl transition-transform duration-500 ease-out group-hover:rotate-[-8deg] group-hover:scale-105" />
            )}
            <span>
              {site.logoText}
              <span className="text-accent">{site.logoAccent}</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden rounded-full border border-line bg-ink/70 p-1.5 font-mono text-[13px] backdrop-blur-md md:flex">
            {nav.links.map((l) => (
              <a key={l.href + l.label} href={l.href} className="relative rounded-full px-4 py-2.5 text-soft transition-colors hover:text-fg">
                {active === l.href && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-raise" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                )}
                <span className="relative">{l.label}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {nav.ctaLabel && (
              <a href={nav.ctaHref} className="btn btn-accent hidden !min-h-11 !px-5 text-sm sm:inline-flex">
                {nav.ctaLabel}
              </a>
            )}
            <button
              type="button"
              className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-line bg-ink/70 backdrop-blur-md md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => toggle(!open)}
            >
              <motion.span className="h-px w-5 bg-fg" animate={open ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }} />
              <motion.span className="h-px w-5 bg-fg" animate={open ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-end bg-ink px-5 pb-10 pt-28 md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {nav.links.map((l, i) => (
                <div key={l.href + l.label} className="overflow-hidden border-b border-line">
                  <motion.a
                    href={l.href}
                    onClick={() => toggle(false)}
                    className="block py-4 font-display text-[11vw] font-semibold leading-none tracking-tight"
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.25 + i * 0.06 }}
                  >
                    {l.label}
                  </motion.a>
                </div>
              ))}
            </nav>
            {nav.ctaLabel && (
              <a href={nav.ctaHref} onClick={() => toggle(false)} className="btn btn-accent mt-8">
                {nav.ctaLabel}
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
