"use client";

/* eslint-disable @next/next/no-img-element -- previews of uploaded media */
import { createContext, useContext, useId, useRef, useState } from "react";
import { Icon } from "./icons";
import { blankFromFields, type Field } from "./schema";

export const INPUT =
  "w-full rounded-lg border border-line2 bg-ink px-3.5 py-3 text-sm text-fg outline-none! transition-[border-color,box-shadow] duration-200 placeholder:text-mute focus:border-accent focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_16%,transparent)]";
export const BTN =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line2 px-3.5 text-[13px] text-fg transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-line2 disabled:hover:text-fg";
/** Borderless icon button for row actions. */
export const GHOST =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-mute transition-colors hover:bg-raise hover:text-fg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-mute";
export const GHOST_DANGER = `${GHOST} hover:!bg-danger/10 hover:!text-danger`;
export const PANEL = "rounded-2xl border border-line bg-panel";
export const PANEL_TITLE = "font-display text-base font-semibold";
const ADD =
  "flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line2 text-[13px] text-soft transition-colors hover:border-accent hover:text-accent";
const COUNT = "rounded-md bg-raise px-1.5 py-0.5 font-mono text-[11px] font-normal leading-none text-mute";

/** Upload + library access, provided by AdminApp. */
export const MediaCtx = createContext<{
  upload: (files: File[]) => Promise<string[]>;
  pick: (onPick: (url: string) => void) => void;
}>({ upload: async () => [], pick: () => {} });

export const isPdf = (url: string) => /\.pdf($|\?)/i.test(url);

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

function Help({ text }: { text?: string }) {
  return text ? <p className="text-xs leading-relaxed text-mute">{text}</p> : null;
}

/** A switch shown as a full-width setting row. */
function Toggle({ label, help, value, onChange }: { label: string; help?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex min-h-14 w-full items-center justify-between gap-4 rounded-xl border border-line bg-ink px-4 py-2.5 text-left transition-colors hover:border-line2"
    >
      <span className="flex flex-col gap-1">
        <span className="text-sm text-fg">{label}</span>
        {help && <span className="text-xs leading-relaxed text-mute">{help}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-2.5">
        <span className={`font-mono text-[11px] uppercase tracking-[0.06em] ${value ? "text-accent" : "text-mute"}`}>{value ? "On" : "Off"}</span>
        <span className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-accent" : "bg-line2"}`}>
          <span className={`absolute top-1 h-4 w-4 rounded-full bg-ink transition-[left] ${value ? "left-6" : "left-1"}`} />
        </span>
      </span>
    </button>
  );
}

function Tags({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts]);
    setDraft("");
  };
  return (
    <div className="flex flex-wrap gap-1.5 rounded-lg border border-line2 bg-ink p-2 transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_16%,transparent)]">
      {value.map((tag, i) => (
        <span key={`${tag}-${i}`} className="flex items-center gap-0.5 rounded-md border border-line bg-raise py-0.5 pl-2.5 pr-0.5 font-mono text-xs text-soft">
          {tag}
          <button type="button" aria-label={`Remove ${tag}`} className="flex h-7 w-7 items-center justify-center rounded text-mute transition-colors hover:text-danger" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <Icon name="close" size={12} weight={2} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={add}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        placeholder="Type and press Enter…"
        aria-label="Add item"
        className="min-w-[160px] flex-1 bg-transparent px-2 py-1.5 text-sm outline-none! placeholder:text-mute"
      />
    </div>
  );
}

function Strings({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {value.map((line, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-3.5 w-5 shrink-0 font-mono text-[11px] text-mute">{String(i + 1).padStart(2, "0")}</span>
          <textarea
            value={line}
            rows={2}
            aria-label={`Line ${i + 1}`}
            onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
            className={`${INPUT} resize-y leading-relaxed`}
          />
          <div className="mt-1 flex shrink-0">
            <button type="button" className={GHOST} aria-label="Move up" disabled={i === 0} onClick={() => onChange(move(value, i, i - 1))}>
              <Icon name="up" size={16} />
            </button>
            <button type="button" className={GHOST} aria-label="Move down" disabled={i === value.length - 1} onClick={() => onChange(move(value, i, i + 1))}>
              <Icon name="down" size={16} />
            </button>
            <button type="button" className={GHOST_DANGER} aria-label="Delete line" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <Icon name="trash" size={16} />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className={ADD} onClick={() => onChange([...value, ""])}>
        <Icon name="plus" size={15} />
        Add line
      </button>
    </div>
  );
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const media = useContext(MediaCtx);
  const file = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  const upload = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    const [url] = await media.upload(files.slice(0, 1));
    if (url) onChange(url);
    setBusy(false);
  };

  return (
    <div
      className={`@container rounded-xl border border-dashed p-4 transition-colors ${over ? "border-accent bg-raise" : "border-line2 bg-ink"}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        upload(Array.from(e.dataTransfer.files));
      }}
    >
      <div className="flex flex-col gap-4 @lg:flex-row">
      <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-panel @lg:h-32 @lg:w-48">
        {!value ? (
          <span className="flex flex-col items-center gap-2 px-3 text-center font-mono text-[11px] text-mute">
            <Icon name="image" size={20} />
            Drop a file here
          </span>
        ) : isPdf(value) ? (
          <span className="font-mono text-xs text-accent">PDF</span>
        ) : (
          <img src={value} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/media/… or https://…" aria-label="File URL" className={`${INPUT} font-mono !text-[13px]`} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={BTN} disabled={busy} onClick={() => file.current?.click()}>
            <Icon name="upload" size={15} />
            {busy ? "Uploading…" : "Upload"}
          </button>
          <button type="button" className={BTN} onClick={() => media.pick(onChange)}>
            <Icon name="image" size={15} />
            Pick from library
          </button>
          {value && (
            <button type="button" className={`${BTN} hover:!border-danger hover:!text-danger`} onClick={() => onChange("")}>
              Clear
            </button>
          )}
        </div>
        <input
          ref={file}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif,application/pdf"
          className="hidden"
          onChange={(e) => {
            upload(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>
      </div>
    </div>
  );
}

type Row = Record<string, unknown>;

function List({ field, value, onChange }: { field: Extract<Field, { type: "list" }>; value: Row[]; onChange: (v: Row[]) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const [drag, setDrag] = useState<number | null>(null);

  const reorder = (from: number, to: number) => {
    onChange(move(value, from, to));
    setOpen((o) => (o === from ? to : o === to ? from : o));
  };

  return (
    <div className="flex flex-col gap-2">
      {value.length === 0 && <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[13px] text-mute">No {field.item}s yet.</p>}
      {value.map((row, i) => {
        const title = (field.titleKey && String(row[field.titleKey] ?? "").trim()) || `New ${field.item}`;
        const expanded = open === i;
        return (
          <div
            key={i}
            className={`rounded-xl border bg-ink transition-colors ${expanded ? "border-accent/60" : drag !== null && drag !== i ? "border-dashed border-line2" : "border-line hover:border-line2"}`}
            onDragOver={(e) => drag !== null && e.preventDefault()}
            onDrop={() => {
              if (drag !== null && drag !== i) reorder(drag, i);
              setDrag(null);
            }}
          >
            <div className="flex items-center gap-1 py-1.5 pl-1.5 pr-2">
              <span
                draggable
                onDragStart={() => setDrag(i)}
                onDragEnd={() => setDrag(null)}
                title="Drag to reorder"
                aria-hidden="true"
                className="flex h-9 w-7 shrink-0 cursor-grab items-center justify-center text-mute active:cursor-grabbing"
              >
                <Icon name="grip" size={16} weight={2.6} />
              </span>
              <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : i)} className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left">
                <span className={`flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 font-mono text-[11px] ${expanded ? "bg-accent text-ink" : "bg-raise text-accent"}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className="truncate text-sm font-medium">{title}</span>
              </button>
              <button type="button" className={`${GHOST} max-sm:hidden`} aria-label="Move up" disabled={i === 0} onClick={() => reorder(i, i - 1)}>
                <Icon name="up" size={16} />
              </button>
              <button type="button" className={`${GHOST} max-sm:hidden`} aria-label="Move down" disabled={i === value.length - 1} onClick={() => reorder(i, i + 1)}>
                <Icon name="down" size={16} />
              </button>
              <button
                type="button"
                className={GHOST}
                aria-label={`Duplicate ${field.item}`}
                title="Duplicate"
                onClick={() => {
                  onChange([...value.slice(0, i + 1), structuredClone(row), ...value.slice(i + 1)]);
                  setOpen(i + 1);
                }}
              >
                <Icon name="copy" size={16} />
              </button>
              <button
                type="button"
                className={GHOST_DANGER}
                aria-label={`Delete ${field.item}`}
                title="Delete"
                onClick={() => {
                  if (!window.confirm(`Delete "${title}"?`)) return;
                  onChange(value.filter((_, j) => j !== i));
                  setOpen(null);
                }}
              >
                <Icon name="trash" size={16} />
              </button>
              <button type="button" className={GHOST} aria-label={expanded ? "Collapse" : "Expand"} tabIndex={-1} onClick={() => setOpen(expanded ? null : i)}>
                <Icon name="chevron" size={15} className={`transition-transform duration-300 ${expanded ? "rotate-90" : ""}`} />
              </button>
            </div>
            {expanded && (
              <div className="flex flex-col gap-5 border-t border-line p-4 md:p-5">
                <div className="flex gap-2 sm:hidden">
                  <button type="button" className={BTN} disabled={i === 0} onClick={() => reorder(i, i - 1)}>
                    <Icon name="up" size={15} />
                    Move up
                  </button>
                  <button type="button" className={BTN} disabled={i === value.length - 1} onClick={() => reorder(i, i + 1)}>
                    <Icon name="down" size={15} />
                    Move down
                  </button>
                </div>
                <Fields fields={field.fields} value={row} onChange={(next) => onChange(value.map((r, j) => (j === i ? next : r)))} />
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        className={ADD}
        onClick={() => {
          onChange([...value, blankFromFields(field.fields)]);
          setOpen(value.length);
        }}
      >
        <Icon name="plus" size={15} />
        Add {field.item}
      </button>
    </div>
  );
}

function FieldEditor({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId();
  if (field.type === "boolean") return <Toggle label={field.label} help={field.help} value={Boolean(value)} onChange={onChange} />;

  let control: React.ReactNode;
  switch (field.type) {
    case "text":
      control = <input id={id} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={INPUT} />;
      break;
    case "number":
      control = <input id={id} type="number" value={Number(value ?? 0)} onChange={(e) => onChange(Number(e.target.value) || 0)} className={INPUT} />;
      break;
    case "textarea":
      control = <textarea id={id} rows={3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={`${INPUT} resize-y leading-relaxed`} />;
      break;
    case "color": {
      const hex = String(value ?? "#C8F751");
      const presets = ["#C8F751", "#FF8A4C", "#7CC4FF", "#F4D35E", "#FF7AB6", "#8CF2C9"];
      control = (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-ink p-3">
          <input id={id} type="color" value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : "#C8F751"} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-line2 bg-ink p-1" />
          <input value={hex} onChange={(e) => onChange(e.target.value)} aria-label={`${field.label} hex value`} className={`${INPUT} !w-32 font-mono`} />
          <span className="flex flex-wrap gap-2 sm:ml-auto">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                aria-label={`Use ${p}`}
                onClick={() => onChange(p)}
                className={`h-9 w-9 rounded-full border-2 border-ink transition-shadow ${hex.toLowerCase() === p.toLowerCase() ? "shadow-[0_0_0_2px_var(--color-fg)]" : "hover:shadow-[0_0_0_2px_var(--color-line2)]"}`}
                style={{ background: p }}
              />
            ))}
          </span>
        </div>
      );
      break;
    }
    case "tags":
      control = <Tags value={(value as string[]) ?? []} onChange={onChange} />;
      break;
    case "strings":
      control = <Strings value={(value as string[]) ?? []} onChange={onChange} />;
      break;
    case "image":
      control = <ImageInput value={String(value ?? "")} onChange={onChange} />;
      break;
    case "list":
      control = <List field={field} value={(value as Row[]) ?? []} onChange={onChange} />;
      break;
  }

  const simple = field.type === "text" || field.type === "number" || field.type === "textarea" || field.type === "color";
  return (
    <div className="flex flex-col gap-2">
      {simple ? (
        <label htmlFor={id} className="text-[13px] font-medium text-soft">
          {field.label}
        </label>
      ) : (
        <p className="flex items-center gap-2 text-[13px] font-medium text-soft">
          {field.label}
          {(field.type === "list" || field.type === "strings" || field.type === "tags") && <span className={COUNT}>{((value as unknown[]) ?? []).length}</span>}
        </p>
      )}
      {control}
      <Help text={field.help} />
    </div>
  );
}

/** Renders a group of fields for one object and reports the updated object. */
export function Fields({ fields, value, onChange }: { fields: Field[]; value: Row; onChange: (v: Row) => void }) {
  return (
    <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className={"half" in f && f.half ? "" : "md:col-span-2"}>
          <FieldEditor field={f} value={value[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />
        </div>
      ))}
    </div>
  );
}

/**
 * A whole editor page: plain fields are grouped into panels and every list
 * gets a panel of its own, so long sections read as separate blocks.
 */
export function Sections({ fields, value, onChange }: { fields: Field[]; value: Row; onChange: (v: Row) => void }) {
  const groups: Field[][] = [];
  for (const f of fields) {
    const last = groups[groups.length - 1];
    if (f.type === "list" || !last || last[0].type === "list") groups.push([f]);
    else last.push(f);
  }
  const HEAD = "flex min-h-14 items-center gap-2.5 px-5 py-3 md:px-6";
  const BODY = "border-t border-line p-5 md:p-6";

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group, i) => {
        const first = group[0];
        if (first.type === "list") {
          const rows = (value[first.key] as Row[]) ?? [];
          return (
            <section key={first.key} className={PANEL}>
              <div className={`${HEAD} flex-wrap`}>
                <h2 className={PANEL_TITLE}>{first.label}</h2>
                <span className={COUNT}>{rows.length}</span>
                {first.help && <p className="w-full text-xs leading-relaxed text-mute sm:ml-auto sm:w-auto">{first.help}</p>}
              </div>
              <div className={BODY}>
                <List field={first} value={rows} onChange={(v) => onChange({ ...value, [first.key]: v })} />
              </div>
            </section>
          );
        }
        const isFirstPlain = !groups.slice(0, i).some((g) => g[0].type !== "list");
        return (
          <section key={first.key} className={PANEL}>
            <div className={HEAD}>
              <h2 className={PANEL_TITLE}>{isFirstPlain ? "General" : "More options"}</h2>
            </div>
            <div className={BODY}>
              <Fields fields={group} value={value} onChange={onChange} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
