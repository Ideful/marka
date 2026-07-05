"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PRICE_TABLE_SELECTOR = "[data-service-price-table]";
const SHIMMER_MS = 2800;

/** Однократная подсветка «Записаться», когда блок с ценами прокручен выше шапки. */
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
      const tables = document.querySelectorAll(PRICE_TABLE_SELECTOR);
      if (tables.length === 0 || hasPlayedRef.current) return;

      const table = tables[tables.length - 1];
      const rect = table.getBoundingClientRect();
      const headerOffset = 72;

      if (rect.bottom < headerOffset) {
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
    const timer = window.setTimeout(() => setShimmer(false), SHIMMER_MS);
    return () => window.clearTimeout(timer);
  }, [shimmer]);

  return shimmer;
}
