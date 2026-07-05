"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PRICE_TABLE_SELECTOR = "[data-service-price-table]";
const HEADER_OFFSET = 72;
const HOME_BOTTOM_THRESHOLD = 96;
const SHIMMER_MS = 2800;
const SHIMMER_ANIMATION = "booking-shimmer-sweep";

function isHomeBottomReached(): boolean {
  const { scrollY, innerHeight } = window;
  const docHeight = document.documentElement.scrollHeight;
  return scrollY + innerHeight >= docHeight - HOME_BOTTOM_THRESHOLD;
}

function isPriceTablePassed(): boolean {
  const tables = document.querySelectorAll(PRICE_TABLE_SELECTOR);
  if (tables.length === 0) return false;

  const table = tables[tables.length - 1];
  const rect = table.getBoundingClientRect();
  return rect.bottom < HEADER_OFFSET;
}

/** Однократная подсветка «Записаться» на главной (конец страницы) или на услугах (после таблицы цен). */
export function useBookingButtonHighlight() {
  const pathname = usePathname();
  const [shimmer, setShimmer] = useState(false);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    hasPlayedRef.current = false;
    setShimmer(false);
  }, [pathname]);

  useEffect(() => {
    function update() {
      if (hasPlayedRef.current) return;

      const shouldHighlight =
        pathname === "/" ? isHomeBottomReached() : isPriceTablePassed();

      if (shouldHighlight) {
        hasPlayedRef.current = true;
        setShimmer(true);
      }
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  useEffect(() => {
    if (!shimmer) return;

    function handleAnimationEnd(event: AnimationEvent) {
      if (event.animationName !== SHIMMER_ANIMATION) return;
      setShimmer(false);
    }

    document.addEventListener("animationend", handleAnimationEnd);
    const fallback = window.setTimeout(() => setShimmer(false), SHIMMER_MS + 150);

    return () => {
      document.removeEventListener("animationend", handleAnimationEnd);
      window.clearTimeout(fallback);
    };
  }, [shimmer]);

  return shimmer;
}

export const bookingHeaderButtonClass = (highlight: boolean, size: "md" | "sm" = "md") => {
  const base =
    size === "md"
      ? "rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white bg-ink hover:bg-ink/85"
      : "rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white bg-ink hover:bg-ink/85";

  return highlight ? `${base} booking-btn-shimmer` : base;
};
