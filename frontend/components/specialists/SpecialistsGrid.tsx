"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SPECIALIST_TIER_LABELS } from "@/data/price-tiers";
import { getApiBaseUrl, resolvePhotoUrl } from "@/lib/api/config";
import type { Specialist } from "@/lib/api/specialists";

type Props = {
  specialists: Specialist[];
};

export function SpecialistsGrid({ specialists }: Props) {
  const apiBase = getApiBaseUrl();
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (specialists.length === 0) {
      setActiveIndex(0);
      return;
    }

    if (activeIndex > specialists.length - 1) {
      setActiveIndex(specialists.length - 1);
    }
  }, [specialists, activeIndex]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? specialists.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === specialists.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (x: number) => {
    touchStartX.current = x;
  };

  const onTouchEnd = (x: number) => {
    if (touchStartX.current === null) return;

    const diff = touchStartX.current - x;
    touchStartX.current = null;

    if (Math.abs(diff) < 40) return;

    if (diff > 0) {
      goNext();
      return;
    }

    goPrev();
  };

  return (
    <section
      className="space-y-4"
      aria-roledescription="carousel"
      aria-label="Список специалистов"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <ul
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          onTouchStart={(e) => onTouchStart(e.changedTouches[0]?.clientX ?? 0)}
          onTouchEnd={(e) => onTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
        >
          {specialists.map((sp) => {
            const photoSrc = resolvePhotoUrl(sp.photo_url, apiBase);
            const previewTitle = sp.description.find((s) => s.title?.trim())?.title;

            return (
              <li key={sp.id} className="w-full shrink-0">
                <Link
                  href={`/specialists/${sp.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition hover:border-accent/40 hover:shadow-md"
                >
                  <div className="aspect-[4/5] w-full bg-sand">
                    {photoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoSrc}
                        alt={sp.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                        Фото скоро
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-accent">
                      {SPECIALIST_TIER_LABELS[sp.class]}
                    </p>
                    <h2 className="text-lg font-semibold uppercase tracking-wide text-ink group-hover:text-accent">
                      {sp.name}
                    </h2>
                    {previewTitle ? (
                      <p className="text-sm text-ink-muted">{previewTitle}</p>
                    ) : null}
                    <span className="mt-3 text-sm font-medium text-ink-muted group-hover:text-ink">
                      Подробнее →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {specialists.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-ink/20 bg-white/95 px-3 py-2 text-sm text-ink shadow transition hover:border-accent hover:text-accent"
              aria-label="Предыдущий специалист"
            >
              ←
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-ink/20 bg-white/95 px-3 py-2 text-sm text-ink shadow transition hover:border-accent hover:text-accent"
              aria-label="Следующий специалист"
            >
              →
            </button>
          </>
        ) : null}
      </div>

      {specialists.length > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {specialists.map((sp, idx) => (
            <button
              key={sp.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Перейти к специалисту ${idx + 1}`}
              aria-current={idx === activeIndex}
              className={`h-2.5 w-2.5 rounded-full transition ${
                idx === activeIndex ? "bg-accent" : "bg-ink/20 hover:bg-ink/35"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
