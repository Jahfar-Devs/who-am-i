"use client";

import { useState } from "react";
import { Icon, type IconName } from "./icons";

type Node = { id: string; icon: IconName } | { id: string; icon: IconName; label: string; children: string[] };

// Sidebar structure: a node is either a page or a menu holding pages.
export const MENU: { title: string; items: Node[] }[] = [
  {
    title: "Overview",
    items: [
      { id: "dashboard", icon: "grid" },
      { id: "messages", icon: "inbox" },
      { id: "media", icon: "image" },
    ],
  },
  {
    title: "Content",
    items: [
      { id: "m-intro", icon: "spark", label: "Intro", children: ["loader", "hero", "stats", "marquee"] },
      { id: "m-profile", icon: "user", label: "Profile", children: ["about", "services", "skills", "credentials"] },
      { id: "m-work", icon: "briefcase", label: "Work", children: ["projects", "experience", "testimonials"] },
      { id: "contact", icon: "mail" },
    ],
  },
  {
    title: "Site",
    items: [
      { id: "m-structure", icon: "layout", label: "Structure", children: ["layout", "nav", "footer"] },
      { id: "m-settings", icon: "sliders", label: "Settings", children: ["site", "tools"] },
    ],
  },
];

/** Breadcrumb for a page, e.g. ["Content", "Work", "Projects"]. */
export function trailOf(id: string, labelOf: (id: string) => string) {
  for (const g of MENU) {
    for (const n of g.items) {
      if (n.id === id) return [g.title, labelOf(id)];
      if ("children" in n && n.children.includes(id)) return [g.title, n.label, labelOf(id)];
    }
  }
  return [labelOf(id)];
}

const ROW = "group flex w-full items-center gap-3 rounded-lg px-3 text-left transition-colors focus-visible:-outline-offset-2!";
const IDLE = "text-soft hover:bg-raise/60 hover:text-fg";
const DOT = <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warn" title="Unsaved changes" />;

export default function Sidebar({
  brand,
  current,
  go,
  labelOf,
  isHidden,
  isDirty,
  unread,
  onSignOut,
}: {
  brand: { text: string; accent: string; logo: string };
  current: string;
  go: (id: string) => void;
  labelOf: (id: string) => string;
  isHidden: (id: string) => boolean;
  isDirty: (id: string) => boolean;
  unread: number;
  onSignOut: () => void;
}) {
  // A menu follows the open page until it is toggled by hand.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const marks = (id: string) => (
    <>
      {isHidden(id) && <span className="rounded border border-line2 px-1.5 py-0.5 font-mono text-[10px] leading-none text-mute">hidden</span>}
      {id === "messages" && unread > 0 && <span className="rounded-full bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none text-ink">{unread}</span>}
      {isDirty(id) && DOT}
    </>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-5">
        {brand.logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- logo comes from the admin media library
          <img src={brand.logo} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-xl" />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent font-display text-base font-bold uppercase text-ink">{brand.text.charAt(0) || "A"}</span>
        )}
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-mono text-sm leading-tight">
            {brand.text}
            <span className="text-accent">{brand.accent}</span>
          </span>
          <span className="text-[11px] leading-tight text-mute">Admin console</span>
        </span>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-3 pb-8 [mask-image:linear-gradient(to_bottom,black_calc(100%-32px),transparent)]">
        {MENU.map((g) => (
          <nav key={g.title} aria-label={g.title} className="flex flex-col gap-0.5">
            <p className="px-3 pb-2 pt-6 font-mono text-[11px] uppercase tracking-[0.1em] text-mute">{g.title}</p>
            {g.items.map((n) => {
              if (!("children" in n)) {
                const active = current === n.id;
                return (
                  <button key={n.id} type="button" onClick={() => go(n.id)} aria-current={active ? "page" : undefined} className={`${ROW} min-h-10 ${active ? "bg-raise text-fg" : IDLE}`}>
                    <Icon name={n.icon} className={active ? "text-accent" : "text-mute group-hover:text-soft"} />
                    <span className="flex-1 truncate">{labelOf(n.id)}</span>
                    {marks(n.id)}
                  </button>
                );
              }
              const within = n.children.includes(current);
              const open = toggled[n.id] ?? within;
              return (
                <div key={n.id}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`sub-${n.id}`}
                    onClick={() => setToggled((t) => ({ ...t, [n.id]: !open }))}
                    className={`${ROW} min-h-10 ${within ? "text-fg hover:bg-raise/60" : IDLE}`}
                  >
                    <Icon name={n.icon} className={within ? "text-accent" : "text-mute group-hover:text-soft"} />
                    <span className="flex-1 truncate">{n.label}</span>
                    {n.children.some(isDirty) && DOT}
                    <Icon name="chevron" size={14} className={`text-mute transition-transform duration-300 ${open ? "rotate-90" : ""}`} />
                  </button>
                  <div id={`sub-${n.id}`} inert={!open} className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="min-h-0 overflow-hidden">
                      <ul className="ml-[21px] flex flex-col gap-0.5 border-l border-line py-1 pl-3">
                        {n.children.map((id) => {
                          const active = current === id;
                          return (
                            <li key={id}>
                              <button
                                type="button"
                                onClick={() => go(id)}
                                aria-current={active ? "page" : undefined}
                                className={`${ROW} relative min-h-9 text-[13px] ${active ? "bg-raise text-fg before:absolute before:-left-[13px] before:top-1/2 before:h-4 before:w-px before:-translate-y-1/2 before:bg-accent" : IDLE}`}
                              >
                                <span className="flex-1 truncate">{labelOf(id)}</span>
                                {marks(id)}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        ))}
      </div>

      <div className="flex shrink-0 flex-col gap-0.5 border-t border-line p-3">
        <a href="/" target="_blank" rel="noreferrer" className={`${ROW} min-h-10 ${IDLE}`}>
          <Icon name="external" className="text-mute group-hover:text-soft" />
          View site
        </a>
        <button type="button" onClick={onSignOut} className={`${ROW} min-h-10 text-soft hover:bg-raise/60 hover:text-danger`}>
          <Icon name="logout" className="text-mute group-hover:text-danger" />
          Sign out
        </button>
      </div>
    </div>
  );
}
