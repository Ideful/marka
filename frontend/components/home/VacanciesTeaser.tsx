import { HomeSection } from "@/components/home/HomeSection";
import { VacanciesTeaserList } from "@/components/home/VacanciesTeaserList";
import {
  HOME_PAGE_SECTION_TONES,
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
      <VacanciesTeaserList vacancies={VACANCIES} />
    </HomeSection>
  );
}
