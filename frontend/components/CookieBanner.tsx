"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "marka-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Согласие на использование cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md md:p-5"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-ink-muted md:max-w-[70%]">
          Пользуясь сайтом, вы соглашаетесь с использованием cookies и{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-ink">
            политикой конфиденциальности
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink/90"
        >
          Принять
        </button>
      </div>
    </div>
  );
}
