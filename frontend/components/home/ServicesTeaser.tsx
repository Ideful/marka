import Link from "next/link";
import { serviceCatalog } from "@/lib/domain/service-catalog";

export function ServicesTeaser() {
  const categories = serviceCatalog.listCategories();
  return (
    <section
      id="services"
      className="scroll-mt-24 bg-sand px-4 py-16 md:px-6 md:py-24"
      aria-labelledby="services-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:gap-14">
        <div className="flex flex-col gap-2 md:gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
            Услуги
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2
              id="services-heading"
              className="text-3xl font-bold uppercase tracking-tight text-ink md:text-4xl"
            >
              Услуги и цены
            </h2>
            <Link
              href="/services"
              className="text-sm font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
            >
              Все разделы →
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/services/${cat.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition hover:border-accent/40 hover:shadow-md"
            >
              <div className="flex flex-col gap-2">
                <p className="text-lg font-semibold text-ink group-hover:text-accent">
                  {cat.title}
                </p>
                {cat.teaser ? (
                  <p className="text-sm text-ink-muted">{cat.teaser}</p>
                ) : null}
              </div>
              <span className="mt-6 text-sm font-medium text-ink-muted group-hover:text-ink">
                Подробнее →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
