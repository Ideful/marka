import type { Metadata } from "next";
import { MessengerLinks } from "@/components/contacts/MessengerLinks";
import { VACANCIES } from "@/data/vacancies";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { salonConfig } from "@/lib/domain/salon-config";

export const metadata: Metadata = {
  title: "Вакансии",
  description: "Открытые позиции в салоне Марка Арена, Балашиха.",
};

export default function VacanciesPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
          Вакансии
        </p>
        <h1 className="mt-3 text-3xl font-bold uppercase tracking-tight text-ink md:text-4xl">
          Присоединяйтесь к команде
        </h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Оставьте отклик удобным способом — по телефону{" "}
          <a className="text-ink underline-offset-4 hover:underline" href={`tel:${salonConfig.phoneTel}`}>
            {salonConfig.phoneDisplay}
          </a>{" "}
          или в мессенджерах.
        </p>

        <div className="mt-12 flex flex-col gap-10">
          {VACANCIES.map((v) => (
            <section
              key={v.slug}
              id={v.slug}
              className="scroll-mt-28 rounded-2xl border border-ink/10 bg-white p-6 md:p-8"
            >
              <h2 className="text-xl font-semibold text-ink">{v.title}</h2>
              <p className="mt-3 text-ink-muted">{v.summary}</p>
              <div className="mt-6">
                <MessengerLinks />
              </div>
            </section>
          ))}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
