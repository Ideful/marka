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

const CLASS_DESCRIPTIONS: Record<SpecialistTierKey, string> = {
  master:
    "Мастер выполняет базовые и востребованные услуги с соблюдением стандартов качества. Это хороший выбор для регулярного ухода и комфортного результата.",
  top_master:
    "Топ-мастер работает со сложными задачами и помогает подобрать оптимальное решение под ваш запрос. Идеален, если нужна уверенность в результате и тонкая настройка техники.",
  stylist:
    "Стилист формирует образ в комплексе: учитывает форму, цвет, структуру волос и ваш стиль жизни. Помогает выбрать наиболее гармоничное решение под индивидуальные особенности.",
  top_stylist:
    "Топ-стилист - высококвалифицированный специалист с широким спектром услуг. Умело использует последние модные тенденции в реализации гармоничных образов, которые подбирает индивидуально каждому гостю.",
  art_director:
    "Арт-директор работает с наиболее сложными кейсами, задаёт вектор стиля и контролирует высокий стандарт сервиса. Рекомендуется для комплексных трансформаций и экспертного сопровождения.",
};
const BOOKING_URL = "https://n717666.yclients.com/company/677152/personal/menu?o=";

export function SpecialistsList({ specialists }: Props) {
  const defaultClass = useMemo<SpecialistTierKey>(() => {
    return (
      SPECIALIST_TIER_KEYS.find((tier) => specialists.some((sp) => sp.class === tier)) ?? "master"
    );
  }, [specialists]);

  const [selectedClass, setSelectedClass] = useState<SpecialistTierKey>(defaultClass);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const apiBase = getApiBaseUrl();

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
    <section className="mx-auto mt-10 max-w-lg space-y-8">
      <div>
        <label
          htmlFor="specialists-class-filter"
          className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-muted sr-only"
        >
          Категория
        </label>
        <div className="rounded-xl bg-ink px-4 py-3 text-center text-base font-semibold uppercase tracking-wide text-white">
          Специалисты
        </div>
        <div className="mt-4 relative">
          <select
            id="specialists-class-filter"
            value={selectedClass}
            onChange={(e) => {
              const v = e.target.value;
              if ((SPECIALIST_TIER_KEYS as readonly string[]).includes(v)) {
                setSelectedClass(v as SpecialistTierKey);
              }
            }}
            className="w-full cursor-pointer appearance-none rounded-xl border border-ink/20 bg-white px-4 py-3.5 pr-12 text-center text-sm font-medium uppercase tracking-wide text-ink shadow-sm transition hover:border-ink/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          >
            {SPECIALIST_TIER_KEYS.map((key) => (
              <option key={key} value={key}>
                {SPECIALIST_TIER_LABELS[key]}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-ink/70">
            ▼
          </span>
        </div>
      </div>

      <p className="text-center text-lg leading-relaxed text-ink-muted md:text-xl">
        {CLASS_DESCRIPTIONS[selectedClass]}
      </p>

      {activeSpecialist ? (
        <div className="space-y-5">
          <div className="text-center text-3xl text-ink md:text-4xl">{activeSpecialist.name}</div>
          <div
            className="relative mx-auto max-w-sm"
            onTouchStart={(e) => onTouchStart(e.changedTouches[0]?.clientX ?? 0)}
            onTouchEnd={(e) => onTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
          >
            <Link href={`/specialists/${activeSpecialist.id}`} className="block">
              <div className="overflow-hidden bg-sand shadow-sm">
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
                  className="absolute -left-12 top-1/2 -translate-y-1/2 text-3xl leading-none text-ink/50 transition hover:text-ink"
                  aria-label="Предыдущий специалист"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute -right-12 top-1/2 -translate-y-1/2 text-3xl leading-none text-ink/50 transition hover:text-ink"
                  aria-label="Следующий специалист"
                >
                  ▶
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-center text-ink-muted">В этой категории пока никого нет.</p>
      )}

      <div className="space-y-5">
        <Link
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl bg-[#121417] px-6 py-4 text-center text-xl font-medium uppercase tracking-wide text-white transition hover:bg-[#121417]/90 md:text-2xl"
        >
          Записаться
        </Link>

        <Link
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl bg-[#121417] px-6 py-4 text-center text-lg font-medium uppercase leading-tight tracking-wide text-white transition hover:bg-[#121417]/90 md:text-xl"
        >
          Бесплатная консультация со специалистом
        </Link>

        <p className="px-4 text-center text-base leading-relaxed text-ink-muted md:text-lg">
          Познакомьтесь с мастером заранее, обсудите пожелания и получите профессиональные
          рекомендации перед процедурой.
        </p>
      </div>
    </section>
  );
}
