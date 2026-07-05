"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { salonConfig } from "@/lib/domain/salon-config";
import { useBookingButtonHighlight } from "@/lib/use-booking-button-highlight";

const links = [
  { href: "/services", label: "Услуги" },
  { href: "/specialists", label: "Специалисты" },
  { href: "/certificates", label: "Сертификаты" },
  { href: "/news", label: "Новости" },
  { href: "/vacancies", label: "Вакансии" },
  { href: "/contacts", label: "Контакты" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const bookingHighlight = useBookingButtonHighlight();

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-sand/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6">
          <Link
            href="/"
            className="inline-flex min-h-[44px] min-w-[44px] items-center font-semibold uppercase tracking-[0.2em] text-ink"
            onClick={closeMenu}
          >
            Марка
          </Link>

          <nav
            className="hidden flex-wrap items-center justify-end gap-x-6 gap-y-2 text-sm text-ink-muted md:flex"
            aria-label="Основное меню"
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-ink transition-colors">
                {l.label}
              </Link>
            ))}
            <Link
              href={salonConfig.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-ink/85"
            >
              Записаться
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href={salonConfig.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white ${
                bookingHighlight
                  ? "booking-btn-shimmer"
                  : "bg-ink hover:bg-ink/85"
              }`}
            >
              Записаться
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink/15 text-ink hover:bg-white/80"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="sr-only">{menuOpen ? "Закрыть меню" : "Открыть меню"}</span>
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 7H19M5 12H19M5 17H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-50 flex flex-col bg-sand md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
        >
          <div className="flex shrink-0 items-center justify-end border-b border-ink/10 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink/15 text-ink hover:bg-white/80"
              onClick={closeMenu}
              aria-label="Закрыть меню"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]" aria-label="Основное меню">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-xl px-4 py-4 text-lg font-medium text-ink hover:bg-white/70 active:bg-white"
                onClick={closeMenu}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={salonConfig.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[52px] items-center justify-center rounded-full bg-ink px-6 text-base font-semibold text-white hover:bg-ink/90"
              onClick={closeMenu}
            >
              Записаться онлайн
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
