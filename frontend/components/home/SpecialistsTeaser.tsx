"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HomeSection } from "@/components/home/HomeSection";
import { HOME_PAGE_SECTION_TONES } from "@/components/home/home-section-styles";
import { getApiBaseUrl, resolvePhotoUrl } from "@/lib/api/config";
import type { Specialist } from "@/lib/api/specialists";

type Props = {
  specialists: Specialist[];
};

export function SpecialistsTeaser({ specialists }: Props) {
  const apiBase = getApiBaseUrl();
  const touchStartX = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (specialists.length === 0) {
      setActiveIndex(0);
      return;
    }
    if (activeIndex > specialists.length - 1) {
      setActiveIndex(specialists.length - 1);
    }
  }, [specialists, activeIndex]);

  if (specialists.length === 0) {
    return null;
  }

  const activeSpecialist = specialists[activeIndex];
  const photoSrc = resolvePhotoUrl(activeSpecialist.photo_url, apiBase);

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
    if (touchStartX.current === null || specialists.length <= 1) return;
    const diff = touchStartX.current - x;
    touchStartX.current = null;

    if (Math.abs(diff) < 40) return;
    if (diff > 0) goNext();
    else goPrev();
  };

  return (
    <HomeSection
      id="specialists"
      headingId="specialists-heading"
      eyebrow="Команда"
      title="Специалисты"
      tone={HOME_PAGE_SECTION_TONES.specialists}
      narrow
      footerAction={{ href: "/specialists", label: "Все специалисты →" }}
    >
      <div className="flex flex-col items-center gap-8 md:gap-10">
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

          {specialists.length > 1 ? (
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

        {specialists.length > 1 ? (
          <div className="flex items-center justify-center gap-2">
            {specialists.map((sp, idx) => (
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
    </HomeSection>
  );
}
