"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type SiteCtx = {
  /** True once the loading screen has finished (or is disabled). */
  ready: boolean;
  setReady: (v: boolean) => void;
  /** Freeze / release page scrolling (menus, drawers). */
  lock: (locked: boolean) => void;
};

const Ctx = createContext<SiteCtx>({ ready: true, setReady: () => {}, lock: () => {} });
export const useSite = () => useContext(Ctx);

export function Providers({
  loader,
  smooth,
  children,
}: {
  loader: boolean;
  smooth: boolean;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(!loader);
  const lenis = useRef<Lenis | null>(null);
  const readyRef = useRef(ready);

  const apply = useCallback((locked: boolean) => {
    document.documentElement.style.overflow = locked ? "hidden" : "";
    if (locked) lenis.current?.stop();
    else lenis.current?.start();
  }, []);

  useEffect(() => {
    if (smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lenis.current = new Lenis({ autoRaf: true, anchors: true, lerp: 0.09 });
    }
    apply(!readyRef.current);
    return () => {
      lenis.current?.destroy();
      lenis.current = null;
      document.documentElement.style.overflow = "";
    };
  }, [smooth, apply]);

  useEffect(() => {
    readyRef.current = ready;
    apply(!ready);
  }, [ready, apply]);

  const value = useMemo(() => ({ ready, setReady, lock: apply }), [ready, apply]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
