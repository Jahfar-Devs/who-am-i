"use client";

/* eslint-disable @next/next/no-img-element -- previews of uploaded media */
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { EASE } from "@/components/site/anim";
import type { Content, SectionId } from "@/lib/default-content";
import { normalizeContent } from "@/lib/shape";
import type { MediaItem, Message } from "@/lib/store";
import ConfirmDialog from "./Confirm";
import { BTN, ConfirmCtx, GHOST, GHOST_DANGER, INPUT, isPdf, MediaCtx, Sections, type ConfirmOptions } from "./fields";
import { Icon, type IconName } from "./icons";
import Login from "./Login";
import { TABS } from "./schema";
import Sidebar, { trailOf } from "./Sidebar";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error || `Request failed (${res.status})`, res.status);
  return json as T;
}

// Every page the admin can show: the fixed ones plus one per schema tab.
const PAGES = [
  { id: "dashboard", label: "Dashboard", description: "Everything on the site at a glance." },
  { id: "messages", label: "Messages", description: "Messages sent from the contact form." },
  { id: "media", label: "Media library", description: "Images and PDFs you can use anywhere on the site." },
  { id: "layout", label: "Section order", description: "Reorder the page and show or hide each section." },
  { id: "tools", label: "Backup and reset", description: "Export, import or reset all content." },
  ...TABS,
];
const FIXED_POSITION: Record<string, string> = { loader: "Before the page", hero: "Always first", footer: "Always last" };

const PRIMARY = `${BTN} !border-accent !bg-accent !font-semibold !text-ink hover:!bg-fg hover:!border-fg`;
const DANGER = `${BTN} hover:!border-danger hover:!text-danger`;
const CARD = "rounded-2xl border border-line bg-panel";
const CARD_TITLE = "font-display text-base font-semibold";
const SPLIT = "grid items-start gap-6 min-[1440px]:grid-cols-[minmax(0,1fr)_320px]";
const TILE = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-raise text-accent";
const INDEX = "flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md bg-raise px-1.5 font-mono text-[11px]";

const labelOf = (id: string) => PAGES.find((p) => p.id === id)?.label ?? id;
const fmtDate = (iso: string) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const isPlaceholder = (url: string) => !url || url.startsWith("/placeholders/");

function StatusPill({ hidden }: { hidden: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase leading-none tracking-[0.06em] ${
        hidden ? "border-line2 text-mute" : "border-accent/30 bg-accent/10 text-accent"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {hidden ? "Hidden" : "Live"}
    </span>
  );
}

/** Side panel of facts about the open page, with optional actions. */
function InfoPanel({ title, rows, children }: { title: string; rows: { k: string; v: React.ReactNode }[]; children?: React.ReactNode }) {
  return (
    <aside className={`${CARD} flex flex-col gap-5 p-6 min-[1440px]:sticky min-[1440px]:top-24`}>
      <h2 className={CARD_TITLE}>{title}</h2>
      <dl className="flex flex-col text-[13px]">
        {rows.map((row) => (
          <div key={row.k} className="flex min-h-11 items-center justify-between gap-4 border-t border-line first:border-t-0">
            <dt className="shrink-0 text-mute">{row.k}</dt>
            <dd className="text-right text-soft">{row.v}</dd>
          </div>
        ))}
      </dl>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </aside>
  );
}

function Empty({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center text-mute">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-raise">
        <Icon name={icon} />
      </span>
      <p className="max-w-xs text-[13px] leading-relaxed">{children}</p>
    </div>
  );
}

function Search({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className="relative block w-full sm:w-72">
      <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} aria-label={label} className={`${INPUT} !py-2.5 !pl-10`} />
    </label>
  );
}

function MediaGrid({
  items,
  onUpload,
  onDelete,
  onPick,
}: {
  items: MediaItem[];
  onUpload: (files: File[]) => void;
  onDelete?: (name: string) => void;
  onPick?: (url: string) => void;
}) {
  const confirm = useContext(ConfirmCtx);
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [copied, setCopied] = useState("");
  const [query, setQuery] = useState("");
  const shown = items.filter((m) => m.name.toLowerCase().includes(query.trim().toLowerCase()));
  const total = items.reduce((n, m) => n + m.size, 0);

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`flex flex-col items-center gap-4 rounded-2xl border border-dashed px-6 py-6 text-center transition-colors sm:flex-row sm:text-left ${over ? "border-accent bg-raise" : "border-line2 bg-panel"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          onUpload(Array.from(e.dataTransfer.files));
        }}
      >
        <span className={TILE}>
          <Icon name="upload" />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-sm font-medium">Drop images or a PDF here</p>
          <p className="font-mono text-[11px] text-mute">PNG · JPG · WEBP · GIF · AVIF · PDF — up to 8 MB each</p>
        </div>
        <button type="button" className={PRIMARY} onClick={() => input.current?.click()}>
          <Icon name="plus" size={15} />
          Choose files
        </button>
        <input
          ref={input}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif,application/pdf"
          className="hidden"
          onChange={(e) => {
            onUpload(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs text-mute">
            {items.length} file{items.length === 1 ? "" : "s"} · {fmtSize(total)}
          </p>
          <Search value={query} onChange={setQuery} label="Search files" />
        </div>
      )}

      {shown.length === 0 ? (
        <section className={CARD}>
          <Empty icon={items.length ? "search" : "image"}>{items.length ? "No files match your search." : "No uploads yet. Files you add appear here."}</Empty>
        </section>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {shown.map((m) => (
            <li key={m.name} className="group flex flex-col overflow-hidden rounded-xl border border-line bg-panel transition-colors hover:border-line2">
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-ink">
                {isPdf(m.url) ? (
                  <span className="font-mono text-sm text-accent">PDF</span>
                ) : (
                  <img src={m.url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
                <span className="absolute left-2 top-2 rounded-md border border-line bg-ink/80 px-1.5 py-1 font-mono text-[10px] uppercase leading-none text-soft backdrop-blur">{m.name.split(".").pop()}</span>
              </div>
              <div className="flex flex-col gap-1 px-3 pt-3">
                <p className="truncate font-mono text-xs text-soft" title={m.name}>
                  {m.name}
                </p>
                <p className="font-mono text-[11px] text-mute">
                  {fmtSize(m.size)} · {fmtDate(m.at)}
                </p>
              </div>
              <div className="flex items-center gap-1 p-2">
                {onPick ? (
                  <button type="button" className={`${PRIMARY} !min-h-9 w-full`} onClick={() => onPick(m.url)}>
                    Use this
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`${BTN} !min-h-9 flex-1`}
                      onClick={() =>
                        navigator.clipboard?.writeText(m.url).then(() => {
                          setCopied(m.name);
                          setTimeout(() => setCopied(""), 1500);
                        })
                      }
                    >
                      <Icon name={copied === m.name ? "check" : "copy"} size={14} />
                      {copied === m.name ? "Copied" : "Copy URL"}
                    </button>
                    <a href={m.url} target="_blank" rel="noreferrer" className={GHOST} aria-label={`Open ${m.name}`}>
                      <Icon name="external" size={16} />
                    </a>
                    {onDelete && (
                      <button type="button" className={GHOST_DANGER} aria-label={`Delete ${m.name}`} onClick={async () => (await confirm({ title: `Delete ${m.name}?`, text: "Sections using this file will show a broken image. This cannot be undone." })) && onDelete(m.name)}>
                        <Icon name="trash" size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminApp() {
  const [phase, setPhase] = useState<"loading" | "login" | "ready">("loading");
  const [content, setContent] = useState<Content | null>(null);
  const [saved, setSaved] = useState<Content | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [tab, setTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [msgFilter, setMsgFilter] = useState<"all" | "unread">("all");
  const [msgQuery, setMsgQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null);
  const [picker, setPicker] = useState<{ onPick: (url: string) => void } | null>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const [ask, setAsk] = useState<ConfirmOptions | null>(null);
  const answerRef = useRef<(yes: boolean) => void>(() => {});

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        answerRef.current = resolve;
        setAsk(options);
      }),
    [],
  );
  const answer = useCallback((yes: boolean) => {
    answerRef.current(yes);
    setAsk(null);
  }, []);

  const notify = useCallback((text: string, bad = false) => setToast({ text, bad }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  /** Run an API call; expired sessions go back to the login screen. */
  const run = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
      try {
        return await fn();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) setPhase("login");
        else notify(err instanceof Error ? err.message : "Something went wrong", true);
      }
    },
    [notify],
  );

  const load = useCallback(async () => {
    try {
      const [c, m, f] = await Promise.all([
        api<{ content: Content }>("/api/admin/content"),
        api<{ messages: Message[] }>("/api/admin/messages"),
        api<{ items: MediaItem[] }>("/api/admin/media"),
      ]);
      setContent(c.content);
      setSaved(c.content);
      setMessages(m.messages);
      setMedia(f.items);
      const initial = window.location.hash.slice(1);
      if (initial) setTab(initial);
      setPhase("ready");
    } catch {
      setPhase("login");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch; state is only set after the request resolves
    load();
  }, [load]);

  // Keep the open tab in sync with the URL hash (back/forward, pasted links).
  useEffect(() => {
    const onHash = () => setTab(window.location.hash.slice(1) || "dashboard");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const dirty = useMemo(() => JSON.stringify(content) !== JSON.stringify(saved), [content, saved]);
  const dirtyTabs = useMemo(() => {
    const set = new Set<string>();
    if (!content || !saved) return set;
    for (const key of Object.keys(content) as (keyof Content)[]) {
      if (JSON.stringify(content[key]) !== JSON.stringify(saved[key])) set.add(key);
    }
    return set;
  }, [content, saved]);

  const save = useCallback(async () => {
    if (!content || saving) return;
    setSaving(true);
    const res = await run(() =>
      api<{ content: Content }>("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      }),
    );
    if (res) {
      setContent(res.content);
      setSaved(res.content);
      notify("Saved. The live site is updated.");
    }
    setSaving(false);
  }, [content, saving, run, notify]);

  // Cmd/Ctrl+S saves, Escape closes the mobile menu; warn before leaving with unsaved edits.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onLeave = (e: BeforeUnloadEvent) => dirty && e.preventDefault();
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [save, dirty]);

  const upload = useCallback(
    async (files: File[]) => {
      if (!files.length) return [];
      const body = new FormData();
      files.forEach((f) => body.append("files", f));
      const res = await run(() => api<{ saved: string[]; rejected: string[]; items: MediaItem[] }>("/api/admin/media", { method: "POST", body }));
      if (!res) return [];
      setMedia(res.items);
      if (res.rejected.length) notify(`Skipped ${res.rejected.join(", ")} (unsupported type or over 8 MB)`, true);
      else notify(`${res.saved.length} file${res.saved.length === 1 ? "" : "s"} uploaded`);
      return res.saved;
    },
    [run, notify],
  );

  const mediaCtx = useMemo(() => ({ upload, pick: (onPick: (url: string) => void) => setPicker({ onPick }) }), [upload]);

  const go = (id: string) => {
    setTab(id);
    setMenuOpen(false);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0 });
  };

  if (phase === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center font-mono text-sm text-mute">
        <span className="caret mr-2 text-accent">▍</span> loading admin
      </main>
    );
  }
  if (phase === "login" || !content || !saved) return <Login onDone={load} />;

  const c = content;
  const original = saved;
  const set = <K extends keyof Content>(key: K, value: Content[K]) => setContent({ ...c, [key]: value });
  const unread = messages.filter((m) => !m.read).length;
  const schemaTab = TABS.find((t) => t.id === tab);
  const meta = PAGES.find((p) => p.id === tab) ?? PAGES[0];
  const current = meta.id;
  const trail = trailOf(current, labelOf);
  const hasVisibility = (id: string) => "visible" in ((c[id as keyof Content] as object | undefined) ?? {});
  const hidden = (id: string) => (c[id as SectionId] as { visible?: boolean } | undefined)?.visible === false;
  const position = c.layout.indexOf(current);
  const liveCount = c.layout.filter((id) => !hidden(id)).length;
  const query = msgQuery.trim().toLowerCase();
  const shownMessages = messages.filter((m) => (msgFilter === "all" || !m.read) && (!query || `${m.name} ${m.email} ${m.message}`.toLowerCase().includes(query)));

  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= c.layout.length) return;
    const next = [...c.layout];
    next.splice(to, 0, next.splice(from, 1)[0]);
    set("layout", next);
  };
  const setVisible = (id: string, visible: boolean) => setContent({ ...c, [id]: { ...(c[id as SectionId] as object), visible } });

  const signOut = async () => {
    const text = dirty ? "You have unsaved changes. They will be lost if you sign out now." : "You will need your password to open the admin console again.";
    if (!(await confirm({ title: "Sign out?", text, confirmLabel: "Sign out", icon: "logout" }))) return;
    await api("/api/admin/logout", { method: "POST" }).catch(() => {});
    setMenuOpen(false);
    setPhase("login");
  };

  const stats: { n: number; label: string; to: string; icon: IconName }[] = [
    { n: c.projects.items.length, label: "Projects", to: "projects", icon: "folder" },
    { n: c.experience.items.length, label: "Roles", to: "experience", icon: "briefcase" },
    { n: c.skills.groups.length, label: "Skill groups", to: "skills", icon: "layers" },
    { n: unread, label: "Unread messages", to: "messages", icon: "inbox" },
    { n: media.length, label: "Media files", to: "media", icon: "image" },
  ];
  // What still holds seed data, so the owner knows what is left to personalise.
  const setup = [
    { label: "Add your photo", done: !isPlaceholder(c.about.photo), to: "about" },
    { label: "Add project screenshots", done: c.projects.items.every((p) => !isPlaceholder(p.image)), to: "projects" },
    { label: "Upload your CV", done: Boolean(c.contact.resumeUrl), to: "contact" },
    { label: "Set your social links", done: c.contact.socials.length > 0 && c.contact.socials.every((s) => !/^https?:\/\/[^/]+\/?$/.test(s.href)), to: "contact" },
    { label: "Add real testimonials", done: c.testimonials.visible, to: "testimonials" },
  ];
  const setupDone = setup.filter((s) => s.done).length;
  const shortcuts: { label: string; to: string; icon: IconName }[] = [
    { label: "Theme and accent colour", to: "site", icon: "sliders" },
    { label: "Navigation links", to: "nav", icon: "layout" },
    { label: "Back up content", to: "tools", icon: "folder" },
  ];

  const sidebar = (
    <Sidebar
      brand={{ text: c.site.logoText, accent: c.site.logoAccent, logo: c.site.logoImage }}
      current={current}
      go={go}
      labelOf={labelOf}
      isHidden={hidden}
      isDirty={(id) => dirtyTabs.has(id)}
      unread={unread}
      onSignOut={signOut}
    />
  );

  return (
    <MediaCtx.Provider value={mediaCtx}>
      <ConfirmCtx.Provider value={confirm}>
      <MotionConfig reducedMotion="user">
        <div className="flex min-h-dvh text-sm">
          <aside className="sticky top-0 hidden h-dvh w-[272px] shrink-0 border-r border-line bg-panel lg:block">{sidebar}</aside>

          <AnimatePresence>
            {menuOpen && (
              <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <button type="button" aria-label="Close menu" className="absolute inset-0 cursor-default bg-ink/70 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
                <motion.aside
                  role="dialog"
                  aria-modal="true"
                  aria-label="Menu"
                  initial={{ x: -32 }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="relative h-full w-[min(86vw,300px)] border-r border-line bg-panel"
                >
                  {sidebar}
                </motion.aside>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 h-16 shrink-0 border-b border-line bg-ink/85 px-4 backdrop-blur-xl md:px-8 lg:px-10">
              <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button type="button" className={`${BTN} w-10 shrink-0 !px-0 lg:hidden`} aria-label="Open menu" onClick={() => setMenuOpen(true)}>
                  <Icon name="menu" />
                </button>
                <nav aria-label="Breadcrumb" className="min-w-0">
                  <ol className="flex items-center gap-2 font-mono text-xs text-mute">
                    {trail.map((t, i) => (
                      <li key={t} className={i === trail.length - 1 ? "truncate text-fg" : "hidden items-center gap-2 sm:flex"} aria-current={i === trail.length - 1 ? "page" : undefined}>
                        {t}
                        {i < trail.length - 1 && (
                          <span aria-hidden="true" className="text-line2">
                            /
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] md:flex ${dirty ? "border-warn/40 text-warn" : "border-line text-mute"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${dirty ? "bg-warn" : "bg-accent"}`} />
                  {dirty ? "Unsaved changes" : "All changes saved"}
                </span>
                {dirty && (
                  <button type="button" className={BTN} onClick={async () => (await confirm({ title: "Discard unsaved changes?", text: "Every edit since your last save is reverted.", confirmLabel: "Discard", icon: "reset" })) && setContent(original)}>
                    Discard
                  </button>
                )}
                <a href="/" target="_blank" rel="noreferrer" className={`${BTN} max-sm:hidden`}>
                  View site
                  <Icon name="external" size={15} />
                </a>
                <button type="button" className={PRIMARY} disabled={!dirty || saving} onClick={save}>
                  {saving ? (
                    "Saving…"
                  ) : (
                    <>
                      Save<span className="hidden sm:inline"> changes</span>
                    </>
                  )}
                  <kbd className="hidden rounded border border-ink/25 px-1.5 py-0.5 font-mono text-[10px] font-normal leading-none xl:inline">⌘S</kbd>
                </button>
              </div>
              </div>
            </header>

            <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 py-8 md:px-8 lg:px-10 lg:py-10">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-2">
                  <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] md:text-[32px]">{meta.label}</h1>
                  <p className="max-w-2xl text-sm text-mute">{meta.description}</p>
                </div>
                {current === "dashboard" && (
                  <button type="button" className={BTN} onClick={() => go("media")}>
                    <Icon name="image" size={16} />
                    Upload media
                  </button>
                )}
              </div>

              <motion.div key={current} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                {schemaTab && (
                  <div className={SPLIT}>
                    <Sections
                      key={schemaTab.id}
                      fields={schemaTab.fields}
                      value={c[schemaTab.id as keyof Content] as Record<string, unknown>}
                      onChange={(v) => setContent({ ...c, [schemaTab.id]: v })}
                    />
                    <InfoPanel
                      title="This section"
                      rows={[
                        { k: "Visibility", v: hasVisibility(current) ? <StatusPill hidden={hidden(current)} /> : "Always shown" },
                        { k: "Position", v: position >= 0 ? `${position + 1} of ${c.layout.length}` : (FIXED_POSITION[current] ?? "Site-wide") },
                        { k: "Changes", v: dirtyTabs.has(current) ? <span className="text-warn">Unsaved</span> : "Saved" },
                      ]}
                    >
                      {position >= 0 && (
                        <button type="button" className={BTN} onClick={() => go("layout")}>
                          Reorder
                        </button>
                      )}
                      <button type="button" className={BTN} disabled={!dirtyTabs.has(current)} onClick={() => setContent({ ...c, [current]: original[current as keyof Content] })}>
                        Revert edits
                      </button>
                    </InfoPanel>
                  </div>
                )}

                {current === "dashboard" && (
                  <div className="flex flex-col gap-6">
                    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-6 xl:grid-cols-5">
                      {stats.map((s, i) => (
                        <li key={s.label} className={`xl:col-span-1 ${i < 3 ? "sm:col-span-2" : "sm:col-span-3"} ${i === 4 ? "max-sm:col-span-2" : ""}`}>
                          <button type="button" onClick={() => go(s.to)} className={`${CARD} group flex h-full w-full flex-col gap-5 p-5 text-left transition-colors hover:border-line2 hover:bg-raise`}>
                            <span className="flex items-center justify-between">
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-raise text-accent transition-colors group-hover:border-line2">
                                <Icon name={s.icon} />
                              </span>
                              <Icon name="arrow" size={16} className="text-mute transition-[transform,color] duration-300 group-hover:translate-x-0.5 group-hover:text-accent" />
                            </span>
                            <span className="flex flex-col gap-2">
                              <span className="font-display text-[34px] font-semibold leading-none tracking-[-0.03em]">{s.n}</span>
                              <span className="text-[13px] text-mute">{s.label}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className="grid items-start gap-6 xl:grid-cols-3">
                      <section className={`${CARD} xl:col-span-2`}>
                        <div className="flex items-center justify-between gap-3 px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <h2 className={CARD_TITLE}>Page structure</h2>
                            <p className="text-[13px] text-mute">Sections in the order visitors see them.</p>
                          </div>
                          <button type="button" className={BTN} onClick={() => go("layout")}>
                            Reorder
                          </button>
                        </div>
                        <ol>
                          {c.layout.map((id, i) => (
                            <li key={id} className="flex min-h-14 items-center gap-4 border-t border-line px-6">
                              <span className="w-6 font-mono text-xs text-mute">{String(i + 1).padStart(2, "0")}</span>
                              <span className="flex min-w-0 flex-1 flex-col gap-0.5 md:flex-row md:items-baseline md:gap-3">
                                <span className="shrink-0 font-medium">{labelOf(id)}</span>
                                <span className="hidden truncate text-[13px] text-mute md:block">{PAGES.find((p) => p.id === id)?.description}</span>
                              </span>
                              <StatusPill hidden={hidden(id)} />
                              <button type="button" className={`${BTN} !min-h-9`} onClick={() => go(id)}>
                                Edit
                              </button>
                            </li>
                          ))}
                        </ol>
                      </section>

                      <div className="flex flex-col gap-6">
                        <section className={`${CARD} flex flex-col gap-4 p-6`}>
                          <div className="flex items-baseline justify-between gap-3">
                            <h2 className={CARD_TITLE}>Finish setup</h2>
                            <span className="font-mono text-xs text-mute">
                              {setupDone} / {setup.length}
                            </span>
                          </div>
                          <div className="h-1 overflow-hidden rounded-full bg-raise" role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={setup.length} aria-valuenow={setupDone}>
                            <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${(setupDone / setup.length) * 100}%` }} />
                          </div>
                          <ul className="flex flex-col">
                            {setup.map((s) => (
                              <li key={s.label}>
                                <button type="button" onClick={() => go(s.to)} className="group flex min-h-11 w-full items-center gap-3 text-left">
                                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${s.done ? "border-accent bg-accent text-ink" : "border-line2"}`}>
                                    {s.done && <Icon name="check" size={12} />}
                                  </span>
                                  <span className={`flex-1 ${s.done ? "text-mute line-through" : "text-soft group-hover:text-fg"}`}>{s.label}</span>
                                  <Icon name="chevron" size={14} className="text-mute group-hover:text-accent" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section className={CARD}>
                          <div className="flex items-center justify-between gap-3 px-6 py-5">
                            <h2 className={CARD_TITLE}>Latest messages</h2>
                            {messages.length > 0 && (
                              <button type="button" className={`${BTN} !min-h-9`} onClick={() => go("messages")}>
                                View all
                              </button>
                            )}
                          </div>
                          {messages.length === 0 ? (
                            <div className="border-t border-line">
                              <Empty icon="inbox">No messages yet. Messages from the contact form land here.</Empty>
                            </div>
                          ) : (
                            messages.slice(0, 4).map((m) => (
                              <button key={m.id} type="button" onClick={() => go("messages")} className="flex w-full flex-col gap-1 border-t border-line px-6 py-4 text-left transition-colors hover:bg-raise">
                                <span className="flex items-center gap-2 font-medium">
                                  {!m.read && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                                  <span className="truncate">{m.name}</span>
                                  <span className="ml-auto shrink-0 font-mono text-[11px] font-normal text-mute">{fmtDate(m.at)}</span>
                                </span>
                                <span className="line-clamp-2 text-[13px] text-soft">{m.message}</span>
                              </button>
                            ))
                          )}
                        </section>

                        <section className={CARD}>
                          <h2 className={`${CARD_TITLE} px-6 py-5`}>Shortcuts</h2>
                          {shortcuts.map((s) => (
                            <button key={s.to} type="button" onClick={() => go(s.to)} className="group flex min-h-12 w-full items-center gap-3 border-t border-line px-6 text-left text-soft transition-colors last:rounded-b-2xl hover:bg-raise hover:text-fg">
                              <Icon name={s.icon} size={16} className="text-mute group-hover:text-accent" />
                              <span className="flex-1">{s.label}</span>
                              <Icon name="chevron" size={14} className="text-mute" />
                            </button>
                          ))}
                        </section>
                      </div>
                    </div>
                  </div>
                )}

                {current === "layout" && (
                  <div className={SPLIT}>
                  <section className={CARD}>
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-6">
                      <div className="flex flex-col gap-1">
                        <h2 className={CARD_TITLE}>Page order</h2>
                        <p className="text-[13px] text-mute">Move sections with the arrows. A hidden section keeps its place but is not shown.</p>
                      </div>
                      <p className="font-mono text-xs text-mute">
                        <span className="text-accent">{liveCount} live</span> · {c.layout.length - liveCount} hidden
                      </p>
                    </div>
                    <ol>
                      <li className="flex min-h-14 items-center gap-4 border-t border-line px-5 text-mute md:px-6">
                        <span className={INDEX}>—</span>
                        <span className="flex-1">Hero</span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.06em]">Always first</span>
                      </li>
                      {c.layout.map((id, i) => (
                        <li key={id} className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-5 py-3 transition-colors hover:bg-raise/40 md:px-6">
                          <span className={`${INDEX} text-accent`}>{String(i + 1).padStart(2, "0")}</span>
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className={`font-medium ${hidden(id) ? "text-mute" : ""}`}>{labelOf(id)}</span>
                            <span className="hidden truncate text-[13px] text-mute sm:block">{PAGES.find((p) => p.id === id)?.description}</span>
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={!hidden(id)}
                            aria-label={`Show ${labelOf(id)}`}
                            onClick={() => setVisible(id, hidden(id))}
                            className="flex min-h-10 w-[104px] items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.06em]"
                          >
                            <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${hidden(id) ? "bg-line2" : "bg-accent"}`}>
                              <span className={`absolute top-1 h-4 w-4 rounded-full bg-ink transition-[left] ${hidden(id) ? "left-1" : "left-6"}`} />
                            </span>
                            <span className={hidden(id) ? "text-mute" : "text-accent"}>{hidden(id) ? "Hidden" : "Live"}</span>
                          </button>
                          <span className="ml-auto flex items-center">
                            <button type="button" className={GHOST} aria-label={`Move ${labelOf(id)} up`} disabled={i === 0} onClick={() => moveSection(i, i - 1)}>
                              <Icon name="up" size={16} />
                            </button>
                            <button type="button" className={GHOST} aria-label={`Move ${labelOf(id)} down`} disabled={i === c.layout.length - 1} onClick={() => moveSection(i, i + 1)}>
                              <Icon name="down" size={16} />
                            </button>
                            <button type="button" className={`${BTN} ml-2 !min-h-9`} onClick={() => go(id)}>
                              Edit
                            </button>
                          </span>
                        </li>
                      ))}
                      <li className="flex min-h-14 items-center gap-4 border-t border-line px-5 text-mute md:px-6">
                        <span className={INDEX}>—</span>
                        <span className="flex-1">Footer</span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.06em]">Always last</span>
                      </li>
                    </ol>
                  </section>
                    <InfoPanel
                      title="Summary"
                      rows={[
                        { k: "Live sections", v: <span className="text-accent">{liveCount}</span> },
                        { k: "Hidden sections", v: c.layout.length - liveCount },
                        { k: "Changes", v: dirtyTabs.has("layout") || c.layout.some((id) => dirtyTabs.has(id)) ? <span className="text-warn">Unsaved</span> : "Saved" },
                      ]}
                    >
                      <button type="button" className={BTN} disabled={!dirtyTabs.has("layout")} onClick={() => set("layout", original.layout)}>
                        Revert order
                      </button>
                    </InfoPanel>
                  </div>
                )}

                {current === "messages" && (
                  <div className={SPLIT}>
                    <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex rounded-lg border border-line bg-panel p-1">
                        {(
                          [
                            ["all", "All", messages.length],
                            ["unread", "Unread", unread],
                          ] as const
                        ).map(([id, label, n]) => (
                          <button
                            key={id}
                            type="button"
                            aria-pressed={msgFilter === id}
                            onClick={() => setMsgFilter(id)}
                            className={`flex min-h-9 items-center gap-2 rounded-md px-3.5 text-[13px] transition-colors ${msgFilter === id ? "bg-raise text-fg" : "text-mute hover:text-fg"}`}
                          >
                            {label}
                            <span className="font-mono text-[11px] text-mute">{n}</span>
                          </button>
                        ))}
                      </div>
                      <Search value={msgQuery} onChange={setMsgQuery} label="Search messages" />
                    </div>

                    {shownMessages.length === 0 ? (
                      <section className={CARD}>
                        <Empty icon={messages.length ? "search" : "inbox"}>{messages.length ? "No messages match this view." : "No messages yet. Messages from the contact form land here."}</Empty>
                      </section>
                    ) : (
                      <ul className="flex flex-col gap-4">
                        {shownMessages.map((m) => (
                          <li key={m.id} className={`${CARD} relative overflow-hidden ${m.read ? "" : "before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-accent"}`}>
                            <div className="flex gap-4 p-5 md:p-6">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-raise font-display text-sm font-semibold uppercase text-accent">
                                {m.name.trim().charAt(0) || "?"}
                              </span>
                              <div className="flex min-w-0 flex-1 flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                                    <p className="flex items-center gap-2.5 font-medium">
                                      {m.name}
                                      {!m.read && <span className="rounded-md bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase leading-none text-ink">New</span>}
                                    </p>
                                    <p className="font-mono text-[11px] text-mute">{fmtDate(m.at)}</p>
                                  </div>
                                  <a href={`mailto:${m.email}`} className="self-start font-mono text-xs text-mute underline-offset-4 hover:text-accent hover:underline">
                                    {m.email}
                                  </a>
                                </div>
                                <p className="whitespace-pre-wrap leading-relaxed text-soft">{m.message}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 border-t border-line bg-ink/40 px-5 py-3 md:px-6">
                              <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`} className={`${BTN} !min-h-9`}>
                                <Icon name="reply" size={15} />
                                Reply by email
                              </a>
                              <button
                                type="button"
                                className={`${BTN} !min-h-9`}
                                onClick={async () => {
                                  const res = await run(() =>
                                    api<{ messages: Message[] }>("/api/admin/messages", {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ id: m.id, read: !m.read }),
                                    }),
                                  );
                                  if (res) setMessages(res.messages);
                                }}
                              >
                                <Icon name="check" size={15} />
                                Mark {m.read ? "unread" : "read"}
                              </button>
                              <button
                                type="button"
                                className={`${GHOST_DANGER} ml-auto`}
                                aria-label={`Delete the message from ${m.name}`}
                                onClick={async () => {
                                  if (!(await confirm({ title: `Delete the message from ${m.name}?`, text: "This cannot be undone." }))) return;
                                  const res = await run(() => api<{ messages: Message[] }>(`/api/admin/messages?id=${encodeURIComponent(m.id)}`, { method: "DELETE" }));
                                  if (res) setMessages(res.messages);
                                }}
                              >
                                <Icon name="trash" size={16} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    </div>
                    <InfoPanel
                      title="Inbox"
                      rows={[
                        { k: "Total", v: messages.length },
                        { k: "Unread", v: unread > 0 ? <span className="text-accent">{unread}</span> : 0 },
                        { k: "Contact form", v: <StatusPill hidden={!c.contact.formEnabled || hidden("contact")} /> },
                        { k: "Shown email", v: <span className="break-all font-mono text-xs">{c.contact.email || "—"}</span> },
                      ]}
                    >
                      <button type="button" className={BTN} onClick={() => go("contact")}>
                        Contact settings
                      </button>
                    </InfoPanel>
                  </div>
                )}

{current === "media" && (
                  <MediaGrid
                    items={media}
                    onUpload={upload}
                    onDelete={async (name) => {
                      const res = await run(() => api<{ items: MediaItem[] }>(`/api/admin/media?name=${encodeURIComponent(name)}`, { method: "DELETE" }));
                      if (res) setMedia(res.items);
                    }}
                  />
                )}

                {current === "tools" && (
                  <div className="grid gap-6 md:grid-cols-3">
                    <section className={`${CARD} flex flex-col gap-5 p-6`}>
                      <span className={TILE}>
                        <Icon name="download" />
                      </span>
                      <div className="flex flex-col gap-2">
                        <h2 className={CARD_TITLE}>Export</h2>
                        <p className="leading-relaxed text-soft">Download all site content as a JSON file. Uploaded images are not included.</p>
                      </div>
                      <button
                        type="button"
                        className={`${BTN} mt-auto self-start`}
                        onClick={() => {
                          const url = URL.createObjectURL(new Blob([JSON.stringify(c, null, 2)], { type: "application/json" }));
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "portfolio-content.json";
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Icon name="download" size={15} />
                        Download JSON
                      </button>
                    </section>
                    <section className={`${CARD} flex flex-col gap-5 p-6`}>
                      <span className={TILE}>
                        <Icon name="upload" />
                      </span>
                      <div className="flex flex-col gap-2">
                        <h2 className={CARD_TITLE}>Import</h2>
                        <p className="leading-relaxed text-soft">Load a JSON backup into the editor. Nothing goes live until you press Save changes.</p>
                      </div>
                      <button type="button" className={`${BTN} mt-auto self-start`} onClick={() => importInput.current?.click()}>
                        <Icon name="upload" size={15} />
                        Choose JSON file
                      </button>
                      <input
                        ref={importInput}
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (!file) return;
                          try {
                            setContent(normalizeContent(JSON.parse(await file.text())));
                            notify("Backup loaded. Review it, then save.");
                          } catch {
                            notify("That file is not valid JSON.", true);
                          }
                        }}
                      />
                    </section>
                    <section className={`${CARD} flex flex-col gap-5 !border-danger/30 p-6`}>
                      <span className={`${TILE} !text-danger`}>
                        <Icon name="reset" />
                      </span>
                      <div className="flex flex-col gap-2">
                        <h2 className={CARD_TITLE}>Reset</h2>
                        <p className="leading-relaxed text-soft">Replace everything with the original content from the CV. Uploads and messages are kept.</p>
                      </div>
                      <button
                        type="button"
                        className={`${DANGER} mt-auto self-start`}
                        onClick={async () => {
                          if (!(await confirm({ title: "Reset all content?", text: "Everything is replaced with the defaults and your edits are lost. This cannot be undone.", confirmLabel: "Reset", icon: "reset" }))) return;
                          const res = await run(() => api<{ content: Content }>("/api/admin/content", { method: "DELETE" }));
                          if (res) {
                            setContent(res.content);
                            setSaved(res.content);
                            notify("Content reset to defaults.");
                          }
                        }}
                      >
                        <Icon name="reset" size={15} />
                        Reset to defaults
                      </button>
                    </section>
                  </div>
                )}
              </motion.div>
            </main>
          </div>
        </div>
      </MotionConfig>

      {picker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Close library" className="absolute inset-0 cursor-default bg-ink/80 backdrop-blur-sm" onClick={() => setPicker(null)} />
          <div role="dialog" aria-modal="true" aria-label="Media library" className="relative flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-ink shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]">
            <div className="flex items-center justify-between gap-3 border-b border-line bg-panel px-6 py-4">
              <h2 className="font-display text-lg font-semibold">Pick from library</h2>
              <button type="button" className={GHOST} aria-label="Close library" onClick={() => setPicker(null)}>
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
            <MediaGrid
              items={media}
              onUpload={upload}
              onPick={(url) => {
                picker.onPick(url);
                setPicker(null);
              }}
            />
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>{ask && <ConfirmDialog options={ask} onAnswer={answer} />}</AnimatePresence>

      {toast && (
        <p role="status" className={`fixed bottom-6 right-6 z-[60] rounded-xl border bg-panel px-5 py-3.5 font-mono text-xs shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)] ${toast.bad ? "border-danger text-danger" : "border-accent text-accent"}`}>
          {toast.text}
        </p>
      )}
      </ConfirmCtx.Provider>
    </MediaCtx.Provider>
  );
}
