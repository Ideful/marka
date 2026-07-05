import Link from "next/link";
import {
  HomeSection,
  homeDarkCardClass,
} from "@/components/home/HomeSection";
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
      tone="dark"
      footerAction={{ href: "/vacancies", label: "Страница вакансий →" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {VACANCIES.map((v) => (
          <Link key={v.slug} href={`/vacancies#${v.slug}`} className={homeDarkCardClass}>
            <span className="font-medium">{v.title}</span>
            <span aria-hidden className="text-lg text-white/70 transition group-hover:text-white">
              →
            </span>
          </Link>
        ))}
      </div>
    </HomeSection>
  );
}
