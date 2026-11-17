"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { EASE } from "@/components/site/anim";
import { BTN, type ConfirmOptions } from "./fields";
import { Icon } from "./icons";

/** Themed replacement for window.confirm. Escape, the backdrop and Cancel all answer "no". */
export default function ConfirmDialog({ options, onAnswer }: { options: ConfirmOptions; onAnswer: (yes: boolean) => void }) {
  const { title, text, confirmLabel = "Delete", icon = "trash", danger = true } = options;
  const cancel = useRef<HTMLButtonElement>(null);
  const confirm = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    cancel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onAnswer(false);
      } else if (e.key === "Tab") {
        // Keep focus on the two buttons.
        e.preventDefault();
        (document.activeElement === cancel.current ? confirm : cancel).current?.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      before?.focus();
    };
  }, [onAnswer]);

  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
      <button type="button" tabIndex={-1} aria-label="Cancel" className="absolute inset-0 cursor-default bg-ink/80 backdrop-blur-sm" onClick={() => onAnswer(false)} />
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={text ? "confirm-text" : undefined}
        className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        <div className="flex gap-4 p-6">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${danger ? "border-danger/30 bg-danger/10 text-danger" : "border-line bg-raise text-accent"}`}>
            <Icon name={icon} />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5 pt-0.5">
            <h2 id="confirm-title" className="break-words font-display text-lg font-semibold leading-snug">
              {title}
            </h2>
            {text && (
              <p id="confirm-text" className="text-[13px] leading-relaxed text-soft">
                {text}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line bg-ink/40 px-6 py-4">
          <button ref={cancel} type="button" className={BTN} onClick={() => onAnswer(false)}>
            Cancel
          </button>
          <button
            ref={confirm}
            type="button"
            className={`${BTN} !font-semibold !text-ink ${danger ? "!border-danger !bg-danger hover:!border-fg hover:!bg-fg" : "!border-accent !bg-accent hover:!border-fg hover:!bg-fg"}`}
            onClick={() => onAnswer(true)}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
