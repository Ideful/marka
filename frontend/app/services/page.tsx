import Link from "next/link";
import type { Metadata } from "next";
import { serviceCatalog } from "@/lib/domain/service-catalog";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Услуги и цены",
  description: "Разделы услуг салона: переходите к видам и подтипам с актуальными ценами.",
};

export default function ServicesIndexPage() {
  const categories = serviceCatalog.listCategories();
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
          Услуги
        </p>
        <h1 className="mt-3 text-3xl font-bold uppercase tracking-tight text-ink md:text-4xl">
          Услуги и цены
        </h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Выберите направление — на странице раздела перечислены подтипы услуг и отдельные страницы с прайсом.
        </p>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/services/${c.slug}`}
                className="flex flex-col rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition hover:border-accent/40 hover:shadow-md"
              >
                <span className="text-lg font-semibold text-ink">{c.title}</span>
                {c.teaser ? (
                  <span className="mt-2 text-sm text-ink-muted">{c.teaser}</span>
                ) : null}
                <span className="mt-4 text-sm font-medium text-accent">Открыть →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <SiteFooter />
    </>
  );
}
