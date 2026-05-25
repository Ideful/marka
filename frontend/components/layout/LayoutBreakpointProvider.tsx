"use client";

import { LAYOUT_BREAKPOINT_DEBUG } from "@/config/layout-breakpoint-debug";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type LayoutBreakpointContextValue = {
  /** Показывать узкую / тач-вёрстку (как на телефоне). */
  isMobileLayout: boolean;
};

const LayoutBreakpointContext = createContext<LayoutBreakpointContextValue | null>(null);

function initialIsMobileLayout(): boolean {
  const { mode } = LAYOUT_BREAKPOINT_DEBUG;
  if (mode === "force-mobile") return true;
  if (mode === "force-desktop") return false;
  return false;
}

export function LayoutBreakpointProvider({ children }: { children: ReactNode }) {
  const [isMobileLayout, setIsMobileLayout] = useState(initialIsMobileLayout);

  useEffect(() => {
    const { mode, mdPx } = LAYOUT_BREAKPOINT_DEBUG;
    if (mode === "force-mobile") {
      setIsMobileLayout(true);
      return;
    }
    if (mode === "force-desktop") {
      setIsMobileLayout(false);
      return;
    }

    const query = window.matchMedia(`(max-width: ${mdPx - 1}px)`);
    const sync = () => setIsMobileLayout(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const value = useMemo(() => ({ isMobileLayout }), [isMobileLayout]);

  return (
    <LayoutBreakpointContext.Provider value={value}>{children}</LayoutBreakpointContext.Provider>
  );
}

export function useLayoutBreakpoint(): LayoutBreakpointContextValue {
  const ctx = useContext(LayoutBreakpointContext);
  if (!ctx) {
    throw new Error("useLayoutBreakpoint must be used within LayoutBreakpointProvider");
  }
  return ctx;
}
