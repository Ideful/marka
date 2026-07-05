import Link from "next/link";
import { HomeSection } from "@/components/home/HomeSection";
import {
  HOME_PAGE_SECTION_TONES,
  homeLightRowCardClass,
} from "@/components/home/home-section-styles";
import { VACANCIES } from "@/data/vacancies";

export function VacanciesTeaser() {
  return (
    <HomeSection
      id="vacancies"
      headingId="vacancies-heading"
      eyebrow="Вакансии"
      title={
        <>
          Присоединяйтесь
          <br />
          к команде
        </>
      }
      tone={HOME_PAGE_SECTION_TONES.vacancies}
      footerAction={{ href: "/vacancies", label: "Страница вакансий →" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {VACANCIES.map((v) => (
          <Link key={v.slug} href={`/vacancies#${v.slug}`} className={homeLightRowCardClass}>
            <span className="font-medium text-ink group-hover:text-accent">{v.title}</span>
            <span aria-hidden className="text-lg text-ink-muted transition group-hover:text-ink">
              →
            </span>
          </Link>
        ))}
      </div>
    </HomeSection>
  );
}
