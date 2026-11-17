"use client";

/* eslint-disable @next/next/no-img-element -- images come from the admin media library, sizes unknown */
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";
import type { Content } from "@/lib/default-content";
import { CountUp, EASE, Reveal, ScrollWords, SectionLabel, SplitText, Tilt } from "./anim";

const H2 = "font-display font-semibold leading-[1.02] tracking-[-0.035em]";
const SWEEP = "absolute -bottom-px left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100";

export function Stats({ data }: { data: Content["stats"] }) {
  return (
    <section aria-label="Key numbers" className="wrap">
      <dl className="grid grid-cols-2 gap-x-6 lg:grid-cols-4">
        {data.items.map((s, i) => (
          <Reveal key={i} delay={i * 0.08} className="group relative flex flex-col-reverse gap-2 py-8">
            <motion.span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px origin-left bg-line2"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.2 + i * 0.1 }}
            />
            <span aria-hidden="true" className="absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100" />
            <dt className="label !text-[12px]">{s.label}</dt>
            <dd className="font-display text-[clamp(40px,5vw,64px)] font-semibold leading-none tracking-[-0.03em] transition-colors duration-300 group-hover:text-accent">
              <CountUp value={s.value} />
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

const wrapRange = (min: number, max: number, v: number) => ((((v - min) % (max - min)) + (max - min)) % (max - min)) + min;

/** One endless ticker row; it speeds up and flips direction with the scroll. */
function MarqueeRow({ items, reverse = false, outline = false }: { items: string[]; reverse?: boolean; outline?: boolean }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [0, 1000], [0, 5], { clamp: false });
  const skewX = useTransform(velocity, [-2000, 2000], [8, -8]);
  const x = useTransform(baseX, (v) => `${wrapRange(-50, 0, v)}%`);
  const direction = useRef(reverse ? 1 : -1);

  useAnimationFrame((_, delta) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const f = factor.get();
    if (f < 0) direction.current = reverse ? -1 : 1;
    else if (f > 0) direction.current = reverse ? 1 : -1;
    const step = direction.current * 2.2 * (Math.min(delta, 60) / 1000);
    baseX.set(baseX.get() + step + step * Math.abs(f));
  });

  // Repeat the list so one half of the track is always wider than the screen.
  const half = Array.from({ length: Math.ceil(14 / items.length) }, () => items).flat();

  return (
    <motion.div
      className={`flex w-max whitespace-nowrap font-display text-[clamp(22px,3vw,34px)] font-medium ${outline ? "text-transparent [-webkit-text-stroke:1px_var(--color-line2)]" : "text-mute"}`}
      style={{ x, skewX }}
    >
      {[...half, ...half].map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-7">{item}</span>
          <span className={outline ? "text-line2 [-webkit-text-stroke:0]" : "text-accent"}>✳</span>
        </span>
      ))}
    </motion.div>
  );
}

export function Marquee({ data }: { data: Content["marquee"] }) {
  if (!data.items.length) return null;
  return (
    <div aria-hidden="true" className="mt-16 flex flex-col gap-4 overflow-hidden border-y border-line py-6">
      <MarqueeRow items={data.items} />
      <MarqueeRow items={[...data.items].reverse()} reverse outline />
    </div>
  );
}

export function About({ data, index }: { data: Content["about"]; index: number }) {
  const photoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: photoRef, offset: ["start end", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="about" className="wrap py-24 md:py-36">
      <SectionLabel index={index} label={data.label} />
      <h2 className={`${H2} mt-8 max-w-[1000px] text-[clamp(32px,5.2vw,72px)]`}>
        <ScrollWords text={data.heading} />
      </h2>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_420px] lg:gap-20">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="grid gap-8 text-[17px] leading-[1.75] text-soft md:grid-cols-2">
            {data.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
          {data.snippet && (
            <Reveal>
              <pre className="overflow-x-auto rounded-xl border border-line bg-panel px-6 py-5 font-mono text-sm leading-relaxed text-soft">
                <span className="text-mute">{data.snippetComment}</span>
                {"\n"}
                {data.snippet}
              </pre>
            </Reveal>
          )}
          <dl className="grid grid-cols-2 gap-x-8">
            {data.facts.map((f, i) => (
              <Reveal key={i} delay={i * 0.06} className="flex flex-col gap-1.5 border-t border-line py-5">
                <dt className="label !text-[12px]">{f.label}</dt>
                <dd className="font-medium">{f.value}</dd>
              </Reveal>
            ))}
          </dl>
        </div>

        {data.photo && (
          // The in-view trigger sits on the figure: a fully clipped element never reports as visible.
          <motion.figure className="flex flex-col gap-4" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-15% 0px" }}>
            <Tilt max={5}>
            <motion.div
              ref={photoRef}
              className="aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-panel"
              variants={{
                hidden: { clipPath: "inset(100% 0% 0% 0%)" },
                show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } },
              }}
            >
              <motion.img src={data.photo} alt={data.photoCaption || "Portrait"} className="h-full w-full scale-[1.18] object-cover" style={{ y: photoY }} />
            </motion.div>
            </Tilt>
            {data.photoCaption && <figcaption className="label !text-[11px]">{data.photoCaption}</figcaption>}
          </motion.figure>
        )}
      </div>
    </section>
  );
}

export function Services({ data, index }: { data: Content["services"]; index: number }) {
  return (
    <section id="services" className="wrap py-24 md:py-32">
      <SectionLabel index={index} label={data.label} />
      <h2 className={`${H2} mt-8 text-[clamp(36px,5.5vw,80px)]`}>
        <SplitText text={data.heading} />
      </h2>
      <ol className="mt-14 border-b border-line">
        {data.items.map((s, i) => (
          <Reveal key={i} delay={i * 0.06} y={20}>
            <li className="group relative overflow-hidden border-t border-line" data-cursor>
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
              />
              <div className="relative grid gap-3 px-1 py-8 transition-[padding,color] duration-500 group-hover:px-6 group-hover:text-ink md:grid-cols-[90px_1fr_1.2fr] md:items-baseline md:gap-8 md:py-10">
                <span className="font-mono text-sm text-accent transition-colors duration-500 group-hover:text-ink">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-[clamp(24px,3vw,38px)] font-semibold leading-tight tracking-[-0.02em]">{s.title}</h3>
                <p className="leading-relaxed text-soft transition-colors duration-500 group-hover:text-ink">{s.text}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function Experience({ data, index }: { data: Content["experience"]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });

  return (
    <section id="experience" className="wrap grid gap-12 py-24 md:py-32 lg:grid-cols-[340px_1fr] lg:gap-20">
      <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
        <SectionLabel index={index} label={data.label} />
        <h2 className={`${H2} text-[clamp(34px,4.4vw,60px)]`}>
          <SplitText text={data.heading} />
        </h2>
      </div>

      <div ref={ref} className="relative pl-7 md:pl-10">
        <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px bg-line" />
        <motion.span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px origin-top bg-accent" style={{ scaleY: scrollYProgress }} />
        <ol className="group/list flex flex-col">
          {data.items.map((job, i) => (
            <li key={i} className="relative border-b border-line py-10 transition-opacity duration-300 first:pt-0 lg:hover:!opacity-100 lg:group-hover/list:opacity-40">
              <motion.span
                aria-hidden="true"
                className={`absolute -left-7 h-[9px] w-[9px] -translate-x-1/2 rounded-full bg-accent shadow-[0_0_0_5px_color-mix(in_srgb,var(--accent)_18%,transparent)] md:-left-10 ${i === 0 ? "top-3" : "top-[52px]"}`}
                initial={{ scale: 0 }}
                whileInView={{ scale: [0, 1.7, 1] }}
                viewport={{ once: true, margin: "-30% 0px" }}
                transition={{ duration: 0.7, ease: EASE }}
              />
              <Reveal>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                  <h3 className="font-display text-[clamp(22px,2.4vw,30px)] font-semibold tracking-[-0.02em]">
                    {job.role} · <span className="text-accent">{job.company}</span>
                  </h3>
                  <p className="label !text-[12px]">
                    {job.period} · {job.location}
                  </p>
                </div>
                <ul className="mt-5 flex list-disc flex-col gap-2.5 pl-5 leading-relaxed text-soft marker:text-line2">
                  {job.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
                <ul className="mt-6 flex flex-wrap gap-2 font-mono text-xs">
                  {job.tags.map((t) => (
                    <li key={t} className="rounded-full border border-line px-3.5 py-2 transition-colors duration-300 hover:border-accent hover:text-accent">
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Skills({ data, index }: { data: Content["skills"]; index: number }) {
  return (
    <section id="skills" className="wrap py-24 md:py-32">
      <SectionLabel index={index} label={data.label} />
      <h2 className={`${H2} mt-8 text-[clamp(34px,4.4vw,60px)]`}>
        <SplitText text={data.heading} />
      </h2>
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.groups.map((g, i) => (
          <motion.article
            key={i}
            className="glow-border group relative overflow-hidden rounded-2xl border border-line bg-panel p-6 transition-colors duration-300 hover:border-line2"
            whileHover={{ y: -6 }}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.8, ease: EASE, delay: (i % 4) * 0.08 }}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
            }}
          >
            {/* Spotlight that follows the pointer inside the card */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)",
              }}
            />
            <div className="relative flex flex-col gap-4">
              <span className="font-mono text-xs tracking-[0.08em] text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-[22px] font-semibold tracking-[-0.01em]">{g.title}</h3>
              <ul className="flex flex-wrap gap-1.5 text-[13px] text-soft">
                {g.items.map((item) => (
                  <li key={item} className="rounded-md bg-raise px-2.5 py-1.5">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export function Credentials({ data, index }: { data: Content["credentials"]; index: number }) {
  return (
    <section id="credentials" className="wrap py-24 md:py-32">
      <SectionLabel index={index} label={data.label} />
      <h2 className={`${H2} mt-8 text-[clamp(34px,4.4vw,60px)]`}>
        <SplitText text={data.heading} />
      </h2>
      <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="label border-b border-line pb-4 !text-[12px]">Education</p>
          {data.education.map((e, i) => (
            <Reveal key={i} delay={i * 0.08} className="group relative flex flex-col gap-2 border-b border-line py-7 transition-[padding] duration-500 hover:pl-3">
              <span aria-hidden="true" className={SWEEP} />
              <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">{e.title}</h3>
              <p className="text-soft">{e.place}</p>
              <p className="label !text-[12px]">
                {e.period} · {e.location}
              </p>
            </Reveal>
          ))}
        </div>
        <div>
          <p className="label border-b border-line pb-4 !text-[12px]">Awards and certifications</p>
          {data.awards.map((a, i) => (
            <Reveal key={i} delay={i * 0.08} className="group relative flex items-baseline justify-between gap-6 border-b border-line py-7 transition-[padding] duration-500 hover:pl-3">
              <span aria-hidden="true" className={SWEEP} />
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">{a.title}</h3>
                <p className="text-soft">{a.issuer}</p>
              </div>
              <p className="font-mono text-sm text-accent">{a.year}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials({ data, index }: { data: Content["testimonials"]; index: number }) {
  return (
    <section id="testimonials" className="wrap py-24 md:py-32">
      <SectionLabel index={index} label={data.label} />
      <h2 className={`${H2} mt-8 text-[clamp(34px,4.4vw,60px)]`}>
        <SplitText text={data.heading} />
      </h2>
      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {data.items.map((t, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <figure className="glow-border flex h-full flex-col justify-between gap-8 rounded-2xl border border-line bg-panel p-8">
              <blockquote className="font-display text-[clamp(20px,2.2vw,28px)] leading-snug tracking-[-0.01em]">“{t.quote}”</blockquote>
              <figcaption className="flex items-center gap-4">
                {t.avatar ? (
                  <img src={t.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-raise font-mono text-sm text-accent">
                    {t.name.slice(0, 1)}
                  </span>
                )}
                <span className="flex flex-col">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-sm text-mute">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
