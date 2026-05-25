import Link from "next/link";
import { VACANCIES } from "@/data/vacancies";

export function VacanciesTeaser() {
  return (
    <section
      id="vacancies"
      className="scroll-mt-24 bg-ink px-4 py-16 text-white md:px-6 md:py-24"
      aria-labelledby="vacancies-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:gap-14">
        <div className="flex flex-col gap-2 md:gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/55">
            Вакансии
          </p>
          <h2
            id="vacancies-heading"
            className="max-w-xl text-3xl font-bold uppercase leading-tight tracking-tight md:text-4xl"
          >
            Присоединяйтесь
            <br />
            к команде
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {VACANCIES.map((v) => (
            <Link
              key={v.slug}
              href={`/vacancies#${v.slug}`}
              className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-5 py-4 transition hover:border-accent/50 hover:bg-white/10"
            >
              <span className="font-medium">{v.title}</span>
              <span aria-hidden className="text-lg text-white/70">
                →
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/vacancies"
          className="text-sm font-medium text-white/70 underline-offset-4 hover:text-white hover:underline"
        >
          Страница вакансий →
        </Link>
      </div>
    </section>
  );
}
