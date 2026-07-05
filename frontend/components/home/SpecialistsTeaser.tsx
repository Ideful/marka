"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SPECIALIST_TIER_KEYS,
  SPECIALIST_TIER_LABELS,
  type SpecialistTierKey,
} from "@/data/price-tiers";
import { getApiBaseUrl, resolvePhotoUrl } from "@/lib/api/config";
import type { Specialist } from "@/lib/api/specialists";

type Props = {
  specialists: Specialist[];
};

export function SpecialistsTeaser({ specialists }: Props) {
  const apiBase = getApiBaseUrl();
  const touchStartX = useRef<number | null>(null);

  const availableClasses = useMemo(
    () => SPECIALIST_TIER_KEYS.filter((tier) => specialists.some((sp) => sp.class === tier)),
    [specialists],
  );

  const defaultClass = useMemo<SpecialistTierKey>(
    () => availableClasses[0] ?? "master",
    [availableClasses],
  );

  const [selectedClass, setSelectedClass] = useState<SpecialistTierKey>(defaultClass);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setSelectedClass(defaultClass);
  }, [defaultClass]);

  const inSelectedClass = useMemo(
    () => specialists.filter((sp) => sp.class === selectedClass),
    [specialists, selectedClass],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedClass]);

  useEffect(() => {
    if (inSelectedClass.length === 0) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex > inSelectedClass.length - 1) {
      setActiveIndex(inSelectedClass.length - 1);
    }
  }, [inSelectedClass, activeIndex]);

  if (specialists.length === 0 || availableClasses.length === 0) {
    return null;
  }

  const activeSpecialist = inSelectedClass[activeIndex];
  const photoSrc = activeSpecialist
    ? resolvePhotoUrl(activeSpecialist.photo_url, apiBase)
    : "";

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? inSelectedClass.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === inSelectedClass.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (x: number) => {
    touchStartX.current = x;
  };

  const onTouchEnd = (x: number) => {
    if (touchStartX.current === null || inSelectedClass.length <= 1) return;
    const diff = touchStartX.current - x;
    touchStartX.current = null;

    if (Math.abs(diff) < 40) return;
    if (diff > 0) goNext();
    else goPrev();
  };

  return (
    <section
      id="specialists"
      className="scroll-mt-24 bg-white px-4 py-16 md:px-6 md:py-24"
      aria-labelledby="specialists-heading"
    >
      <div className="mx-auto flex max-w-lg flex-col items-center gap-8 md:gap-10">
        <div className="w-full space-y-4">
          <div
            id="specialists-heading"
            className="rounded-xl bg-ink px-4 py-3 text-center text-base font-semibold uppercase tracking-wide text-white md:text-lg"
          >
            Специалисты
          </div>

          <div className="relative">
            <label htmlFor="home-specialists-class-filter" className="sr-only">
              Категория специалиста
            </label>
            <select
              id="home-specialists-class-filter"
              value={selectedClass}
              onChange={(e) => {
                const v = e.target.value;
                if ((SPECIALIST_TIER_KEYS as readonly string[]).includes(v)) {
                  setSelectedClass(v as SpecialistTierKey);
                }
              }}
              className="w-full cursor-pointer appearance-none rounded-xl border border-ink/20 bg-white px-4 py-3.5 pr-12 text-center text-sm font-medium uppercase tracking-wide text-ink shadow-sm transition hover:border-ink/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            >
              {availableClasses.map((key) => (
                <option key={key} value={key}>
                  {SPECIALIST_TIER_LABELS[key]}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-ink/70"
              aria-hidden
            >
              ▼
            </span>
          </div>
        </div>

        {activeSpecialist ? (
          <div className="w-full space-y-5">
            <p className="text-center text-2xl text-ink md:text-3xl">{activeSpecialist.name}</p>

            <div
              className="relative mx-auto w-full max-w-sm"
              onTouchStart={(e) => onTouchStart(e.changedTouches[0]?.clientX ?? 0)}
              onTouchEnd={(e) => onTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
            >
              <Link href={`/specialists/${activeSpecialist.id}`} className="block">
                <div className="overflow-hidden rounded-2xl border border-ink/10 bg-sand shadow-sm">
                  {photoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoSrc}
                      alt={activeSpecialist.name}
                      className="aspect-[3/4] w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center text-sm text-ink-muted">
                      Фото скоро
                    </div>
                  )}
                </div>
              </Link>

              {inSelectedClass.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-xl leading-none text-ink/60 shadow transition hover:text-ink md:-left-12 md:bg-transparent md:p-0 md:shadow-none"
                    aria-label="Предыдущий специалист"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-xl leading-none text-ink/60 shadow transition hover:text-ink md:-right-12 md:bg-transparent md:p-0 md:shadow-none"
                    aria-label="Следующий специалист"
                  >
                    ▶
                  </button>
                </>
              ) : null}
            </div>

            {inSelectedClass.length > 1 ? (
              <div className="flex items-center justify-center gap-2">
                {inSelectedClass.map((sp, idx) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Перейти к специалисту ${idx + 1}`}
                    aria-current={idx === activeIndex}
                    className={`h-2 w-2 rounded-full transition ${
                      idx === activeIndex ? "bg-accent" : "bg-ink/20 hover:bg-ink/35"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-center text-ink-muted">В этой категории пока никого нет.</p>
        )}

        <Link
          href="/specialists"
          className="text-sm font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
        >
          Все специалисты →
        </Link>
      </div>
    </section>
  );
}
