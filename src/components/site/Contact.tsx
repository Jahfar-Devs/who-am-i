"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Content } from "@/lib/default-content";
import { Magnetic, Reveal, SectionLabel, SplitText } from "./anim";

type State = "idle" | "sending" | "sent" | "error";
const FIELD =
  "w-full rounded-xl border border-line2 bg-ink/70 px-4 py-3.5 text-fg outline-none! transition-[border-color,box-shadow] duration-200 placeholder:text-mute focus:border-accent focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_16%,transparent)]";

function Form() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not send the message. Please email me instead.");
      form.reset();
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the message.");
      setState("error");
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-soft">
          Name
          <input name="name" required maxLength={120} autoComplete="name" className={FIELD} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-soft">
          Email
          <input name="email" type="email" required maxLength={200} autoComplete="email" className={FIELD} />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm text-soft">
        Message
        <textarea name="message" required rows={5} maxLength={5000} className={`${FIELD} resize-y`} />
      </label>
      {/* Honeypot for bots; hidden from people and assistive tech */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === "sending"} className="btn btn-accent disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Send message"}
          <span aria-hidden="true">→</span>
        </button>
        <AnimatePresence mode="wait">
          {state === "sent" && (
            <motion.p key="ok" role="status" className="font-mono text-sm text-accent" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              201 Created — message received.
            </motion.p>
          )}
          {state === "error" && (
            <motion.p key="err" role="alert" className="font-mono text-sm text-danger" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

export function Contact({ data, index }: { data: Content["contact"]; index: number }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <section id="contact" className="border-t border-line">
      <div className="wrap py-24 md:py-36">
        <SectionLabel index={index} label={data.label} />
        <h2 className="mt-10 font-display text-[clamp(48px,11vw,160px)] font-bold uppercase leading-[0.9] tracking-[-0.045em]">
          <SplitText text={data.headingLine1} by="letter" className="block" />
          <span className="block">
            <SplitText text={data.headingLine2} by="letter" delay={0.2} />{" "}
            <SplitText text={data.headingAccent} by="letter" delay={0.45} className="text-accent" />
          </span>
        </h2>

        <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal className="flex flex-col gap-8">
            <p className="max-w-[460px] text-lg leading-relaxed text-soft">{data.intro}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Magnetic strength={0.15}>
                <a
                  href={`mailto:${data.email}`}
                  className="break-all border-b border-line2 py-2 font-display text-[clamp(18px,2.4vw,30px)] font-medium transition-colors hover:border-accent hover:text-accent"
                >
                  {data.email} ↗
                </a>
              </Magnetic>
              <button
                type="button"
                className="min-h-11 rounded-full border border-line px-4 font-mono text-xs text-soft transition-colors hover:border-accent hover:text-accent"
                onClick={() => navigator.clipboard?.writeText(data.email).then(() => setCopied(true))}
              >
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
            <ul className="flex flex-wrap gap-3 font-mono text-[13px]">
              {data.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="flex min-h-11 items-center rounded-full border border-line px-5 transition-colors hover:border-accent hover:text-accent">
                    {s.label} ↗
                  </a>
                </li>
              ))}
              {data.phone && (
                <li>
                  <a href={`tel:${data.phone.replace(/[^\d+]/g, "")}`} className="flex min-h-11 items-center rounded-full border border-line px-5 transition-colors hover:border-accent hover:text-accent">
                    {data.phone}
                  </a>
                </li>
              )}
              {data.resumeUrl && (
                <li>
                  <a href={data.resumeUrl} target="_blank" rel="noreferrer" className="flex min-h-11 items-center rounded-full border border-accent px-5 text-accent">
                    Download CV ↓
                  </a>
                </li>
              )}
            </ul>
          </Reveal>
          {data.formEnabled && (
            <Reveal delay={0.15}>
              <div className="glow-border rounded-3xl border border-line bg-panel/70 p-6 backdrop-blur md:p-8">
                <Form />
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

export function Footer({ data, brand }: { data: Content["footer"]; brand: { text: string; accent: string } }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      try {
        setTime(new Intl.DateTimeFormat("en-GB", { timeStyle: "medium", timeZone: data.timeZone }).format(new Date()));
      } catch {
        setTime("");
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data.timeZone]);

  // Size the wordmark so the whole logo spans the page whatever its length.
  const letters = Math.max(4, brand.text.length + brand.accent.length);
  const wordmark = `clamp(56px, ${Math.min(28, 180 / letters)}vw, ${Math.floor(1180 / (letters * 0.5))}px)`;

  return (
    <footer className="overflow-hidden border-t border-line">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-8 font-mono text-xs uppercase tracking-[0.06em] text-mute">
      <span>{data.left}</span>
      <span>{data.center}</span>
      {time && <span className="tabular-nums">Local time {time}</span>}
      <span>{data.right}</span>
      <a href="#top" className="py-2 text-fg hover:text-accent">
        Back to top ↑
      </a>
      </div>
      {(brand.text || brand.accent) && (
        <p aria-hidden="true" className="wrap select-none whitespace-nowrap pb-8 font-display font-bold leading-[1.05] tracking-[-0.05em]" style={{ fontSize: wordmark }}>
          <SplitText text={brand.text} by="letter" stagger={0.06} className="outline-text" />
          <SplitText text={brand.accent} by="letter" stagger={0.06} delay={0.3} className="text-accent" />
        </p>
      )}
    </footer>
  );
}
