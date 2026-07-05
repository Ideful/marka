"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const BOOKING_TRIGGER_SELECTOR = "[data-service-price-table], [data-booking-trigger]";
const HEADER_OFFSET = 72;
const HOME_BOTTOM_THRESHOLD = 96;
const SHIMMER_MS = 2800;
const SHIMMER_ANIMATION = "booking-shimmer-sweep";

function isHomeBottomReached(): boolean {
  const { scrollY, innerHeight } = window;
  const docHeight = document.documentElement.scrollHeight;
  return scrollY + innerHeight >= docHeight - HOME_BOTTOM_THRESHOLD;
}

function isBookingTriggerPassed(): boolean {
  const triggers = document.querySelectorAll(BOOKING_TRIGGER_SELECTOR);
  if (triggers.length === 0) return false;

  const trigger = triggers[triggers.length - 1];
  const rect = trigger.getBoundingClientRect();
  return rect.bottom < HEADER_OFFSET;
}

function isSpecialistDetailPage(pathname: string): boolean {
  return /^\/specialists\/\d+$/.test(pathname);
}

function isSpecialistsArea(pathname: string): boolean {
  return pathname.startsWith("/specialists");
}

function shouldHighlight(pathname: string): boolean {
  if (pathname === "/") return isHomeBottomReached();
  if (isBookingTriggerPassed()) return true;
  if (isSpecialistDetailPage(pathname)) return isHomeBottomReached();
  return false;
}

/** Сохраняется между /specialists/* — сбрасывается только при уходе из раздела. */
let specialistsAreaShimmerPlayed = false;

/** Однократная подсветка «Записаться» на главной, услугах и карточке специалиста. */
export function useBookingButtonHighlight() {
  const pathname = usePathname();
  const [shimmer, setShimmer] = useState(false);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (isSpecialistsArea(pathname)) {
      if (specialistsAreaShimmerPlayed) {
        hasPlayedRef.current = true;
        setShimmer(false);
        return;
      }
      hasPlayedRef.current = false;
      setShimmer(false);
      return;
    }

    specialistsAreaShimmerPlayed = false;
    hasPlayedRef.current = false;
    setShimmer(false);
  }, [pathname]);

  useEffect(() => {
    function update() {
      if (hasPlayedRef.current) return;

      if (shouldHighlight(pathname)) {
        hasPlayedRef.current = true;
        if (isSpecialistsArea(pathname)) {
          specialistsAreaShimmerPlayed = true;
        }
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

export const bookingOnlineButtonClass = (menuOpen: boolean) => {
  const base =
    "mt-4 inline-flex min-h-[52px] w-full items-center justify-center rounded-full px-6 text-base font-semibold text-white";

  return menuOpen
    ? `${base} relative isolate overflow-visible booking-btn-perimeter-glow`
    : `${base} bg-ink hover:bg-ink/90`;
};
