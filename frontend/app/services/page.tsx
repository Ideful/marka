import Link from "next/link";
import type { Metadata } from "next";
import { fetchMainServices, serviceDirectionHref } from "@/lib/api/services";
import { resolvePageSeo } from "@/lib/api/seo";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageSeo("/services", {
    title: "Услуги и цены",
    description: "Разделы услуг салона: переходите к видам и подтипам с актуальными ценами.",
  });
}

export default async function ServicesIndexPage() {
  let categories: Awaited<ReturnType<typeof fetchMainServices>> = [];
  let loadError: string | null = null;

  try {
    categories = await fetchMainServices();
  } catch {
    loadError =
      "Не удалось загрузить каталог услуг. Проверьте, что запущен backend (make dev-backend).";
  }

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
          Выберите направление — откроется прайс с типами услуг.
        </p>

        {loadError ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {loadError}
          </p>
        ) : (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {categories.map((c) => {
              const href = c.services.length > 0 ? serviceDirectionHref(c) : null;
              const cardClass =
                "flex flex-col rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition hover:border-accent/40 hover:shadow-md";

              return (
                <li key={c.slug}>
                  {href ? (
                    <Link href={href} className={cardClass}>
                      <span className="text-lg font-semibold text-ink">{c.name}</span>
                      <span className="mt-4 text-sm font-medium text-accent">Открыть →</span>
                    </Link>
                  ) : (
                    <div className={`${cardClass} opacity-60`}>
                      <span className="text-lg font-semibold text-ink">{c.name}</span>
                      <span className="mt-4 text-sm text-ink-muted">Скоро</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
