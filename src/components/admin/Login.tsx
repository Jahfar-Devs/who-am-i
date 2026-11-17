"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, MotionConfig, useAnimationControls } from "motion/react";
import { EASE } from "@/components/site/anim";
import NetworkCanvas from "@/components/site/NetworkCanvas";

type Status = "idle" | "busy" | "error" | "ok";

const STAGGER = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } };
const RISE = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } };

const icon = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const LockIcon = () => (
  <svg {...icon}>
    <rect x="4" y="11" width="16" height="10" rx="2.5" />
    <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
  </svg>
);
const EyeIcon = ({ off }: { off: boolean }) => (
  <svg {...icon}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
);

/** Left panel: the sign-in shown as the API request it is, with a live status line. */
function RequestPanel({ status, code, error }: { status: Status; code: number; error: string }) {
  const line = {
    idle: { tone: "text-mute", text: "awaiting credentials" },
    busy: { tone: "text-warn", text: "verifying" },
    error: { tone: "text-danger", text: `${code || "ERR"} ${error.toLowerCase()}` },
    ok: { tone: "text-accent", text: "200 access granted" },
  }[status];
  return (
    <aside className="relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:p-12">
      <NetworkCanvas />
      <motion.p variants={RISE} className="label relative !text-[12px]">
        Portfolio admin
      </motion.p>
      <motion.h2 variants={RISE} className="relative font-display text-[clamp(44px,5vw,76px)] font-semibold leading-[0.98] tracking-[-0.03em]">
        Every section,
        <br />
        <span className="outline-text">one</span> <span className="text-accent">console.</span>
      </motion.h2>
      <motion.div variants={RISE} className="relative max-w-md overflow-hidden rounded-2xl border border-line bg-panel/80 font-mono text-[13px] backdrop-blur">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3 text-mute">
          <span className="rounded bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-ink">POST</span>
          /api/admin/login
        </div>
        <dl className="grid grid-cols-[84px_1fr] gap-x-4 gap-y-2.5 px-4 py-4">
          <dt className="text-mute">scope</dt>
          <dd className="text-soft">content · media · messages</dd>
          <dt className="text-mute">session</dt>
          <dd className="text-soft">12h · signed · httpOnly</dd>
          <dt className="text-mute">status</dt>
          <dd className={line.tone} aria-hidden="true">
            {line.text}
            {(status === "idle" || status === "busy") && <span className="caret">▍</span>}
          </dd>
        </dl>
      </motion.div>
    </aside>
  );
}

export default function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [code, setCode] = useState(0);
  const shake = useAnimationControls();
  const locked = status === "busy" || status === "ok";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;
    setStatus("busy");
    setError("");
    let http = 0;
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      http = res.status;
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
      setStatus("ok");
      setTimeout(onDone, 650);
    } catch (err) {
      setCode(http);
      setError(err instanceof Error ? err.message : "Could not sign in");
      setStatus("error");
      shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.4 } });
    }
  }

  const capsCheck = (e: React.KeyboardEvent) => setCaps(e.getModifierState("CapsLock"));

  return (
    <MotionConfig reducedMotion="user">
      <motion.main variants={STAGGER} initial="hidden" animate="show" className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
        <RequestPanel status={status} code={code} error={error} />

        <section className="relative flex min-h-screen flex-col overflow-hidden px-5 py-6 sm:px-10">
          {/* Backdrop: faded grid and an accent glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] bg-[size:56px_56px] opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
          />
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[110px]" />

          <motion.div variants={RISE} className="relative">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 font-mono text-[13px] text-mute transition-colors hover:text-accent">
              <span aria-hidden="true">←</span> Back to site
            </Link>
          </motion.div>

          <div className="relative flex flex-1 items-center justify-center py-10">
            <motion.div animate={shake} className="w-full max-w-[420px]">
            <motion.form
              variants={STAGGER}
              initial="hidden"
              animate="show"
              onSubmit={submit}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
              className="group relative flex w-full flex-col gap-6 overflow-hidden rounded-3xl border border-line bg-panel/85 p-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-9"
            >
              {/* Pointer spotlight and top accent line */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: "radial-gradient(340px circle at var(--mx, 50%) var(--my, 0%), color-mix(in srgb, var(--accent) 11%, transparent), transparent 70%)" }}
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />

              <motion.div variants={RISE} className="relative flex flex-col gap-5">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors duration-500 ${status === "ok" ? "border-accent bg-accent text-ink" : "border-line2 bg-raise text-accent"}`}>
                  {status === "ok" ? (
                    <svg {...icon} strokeWidth={2.4}>
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  ) : (
                    <LockIcon />
                  )}
                </span>
                <div className="flex flex-col gap-2">
                  <h1 className="font-display text-[34px] font-semibold leading-none tracking-[-0.02em]">Welcome back</h1>
                  <p className="text-[15px] text-mute">Sign in to manage your portfolio.</p>
                </div>
              </motion.div>

              <motion.div variants={RISE} className="relative flex flex-col gap-2">
                <label htmlFor="admin-password" className="text-[13px] text-soft">
                  Password
                </label>
                <div
                  className={`flex items-center rounded-xl border bg-ink transition-[border-color,box-shadow] duration-300 ${
                    status === "error" ? "border-danger" : "border-line2 focus-within:border-accent focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--accent)_16%,transparent)]"
                  }`}
                >
                  <span className="pl-4 text-mute">
                    <LockIcon />
                  </span>
                  <input
                    id="admin-password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    autoFocus
                    spellCheck={false}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    onKeyDown={capsCheck}
                    onKeyUp={capsCheck}
                    onBlur={() => setCaps(false)}
                    aria-invalid={status === "error"}
                    aria-describedby={error ? "admin-login-error" : undefined}
                    className="h-[52px] min-w-0 flex-1 bg-transparent px-3 text-base text-fg outline-none!"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    aria-pressed={show}
                    className="mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-mute transition-colors hover:text-accent"
                  >
                    <EyeIcon off={show} />
                  </button>
                </div>
                {caps && <p className="font-mono text-xs text-warn">Caps Lock is on</p>}
                {error && status === "error" && (
                  <p id="admin-login-error" role="alert" className="text-sm text-danger">
                    {error}
                  </p>
                )}
              </motion.div>

              <motion.button
                variants={RISE}
                type="submit"
                disabled={locked}
                className="group/btn relative flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl bg-accent font-semibold text-ink transition-colors duration-300 hover:bg-fg disabled:hover:bg-accent"
              >
                {status === "busy" && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />}
                {status === "busy" ? "Signing in…" : status === "ok" ? "Access granted" : "Sign in"}
                {status !== "busy" && status !== "ok" && (
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover/btn:translate-x-1">
                    →
                  </span>
                )}
              </motion.button>
            </motion.form>
            </motion.div>
          </div>

          <motion.p variants={RISE} className="relative text-center font-mono text-xs text-mute">
            Private area · session ends after 12 hours
          </motion.p>
        </section>
      </motion.main>
    </MotionConfig>
  );
}
