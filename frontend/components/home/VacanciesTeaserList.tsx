"use client";

import { useState } from "react";
import { homeLightRowCardClass } from "@/components/home/home-section-styles";
import { VacancyApplicationModal } from "@/components/vacancies/VacancyApplicationModal";
import type { Vacancy } from "@/data/vacancies";

type Props = {
  vacancies: Vacancy[];
};

export function VacanciesTeaserList({ vacancies }: Props) {
  const [activeVacancy, setActiveVacancy] = useState<Vacancy | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {vacancies.map((v) => (
          <button
            key={v.slug}
            type="button"
            className={`${homeLightRowCardClass} w-full text-left`}
            onClick={() => setActiveVacancy(v)}
          >
            <span className="font-medium text-ink group-hover:text-accent">{v.title}</span>
            <span aria-hidden className="text-lg text-ink-muted transition group-hover:text-ink">
              →
            </span>
          </button>
        ))}
      </div>

      <VacancyApplicationModal vacancy={activeVacancy} onClose={() => setActiveVacancy(null)} />
    </>
  );
}
