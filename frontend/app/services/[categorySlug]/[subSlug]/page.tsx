import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceCatalog, serviceCatalog } from "@/lib/domain/service-catalog";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PriceTable } from "@/components/services/PriceTable";

type Props = { params: Promise<{ categorySlug: string; subSlug: string }> };

export function generateStaticParams() {
  return ServiceCatalog.subRouteSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, subSlug } = await params;
  const found = serviceCatalog.getSubcategory(categorySlug, subSlug);
  if (!found) return {};
  return {
    title: `${found.sub.title} — ${found.category.title}`,
    description:
      found.sub.description ??
      `Прайс: ${found.sub.title}. ${found.category.title}, салон Марка Арена.`,
  };
}

export default async function ServiceSubPage({ params }: Props) {
  const { categorySlug, subSlug } = await params;
  const found = serviceCatalog.getSubcategory(categorySlug, subSlug);
  if (!found) notFound();

  const { category, sub } = found;

  return (
    <>
      <article className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <nav className="text-sm text-ink-muted" aria-label="Хлебные крошки">
          <Link href="/services" className="hover:text-ink hover:underline">
            Услуги
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/services/${category.slug}`} className="hover:text-ink hover:underline">
            {category.title}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{sub.title}</span>
        </nav>

        <h1 className="mt-6 text-3xl font-bold uppercase tracking-tight text-ink md:text-4xl">
          {sub.title}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">{category.title}</p>

        {sub.description ? (
          <p className="mt-6 max-w-2xl text-ink-muted">{sub.description}</p>
        ) : null}

        <div className="mt-10">
          <h2 className="sr-only">Прайс</h2>
          <PriceTable rows={sub.rows} />
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={`/services/${category.slug}`}
            className="text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            ← Все подтипы раздела
          </Link>
          <Link href="/contacts" className="text-sm font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline">
            Запись и контакты
          </Link>
        </div>
      </article>
      <SiteFooter />
    </>
  );
}
