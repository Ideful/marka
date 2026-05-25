import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serviceCatalog } from "@/lib/domain/service-catalog";
import { SERVICE_TREE } from "@/data/service-tree";
import { SiteFooter } from "@/components/layout/SiteFooter";

type Props = { params: Promise<{ categorySlug: string }> };

export function generateStaticParams() {
  return SERVICE_TREE.map((c) => ({ categorySlug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const cat = serviceCatalog.getCategory(categorySlug);
  if (!cat) return {};
  return {
    title: cat.title,
    description: cat.teaser ?? `Услуги: ${cat.title}. Салон Марка Арена, Балашиха.`,
  };
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const cat = serviceCatalog.getCategory(categorySlug);
  if (!cat) notFound();

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <nav className="text-sm text-ink-muted" aria-label="Хлебные крошки">
          <Link href="/services" className="hover:text-ink hover:underline">
            Услуги
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{cat.title}</span>
        </nav>

        <h1 className="mt-6 text-3xl font-bold uppercase tracking-tight text-ink md:text-4xl">
          {cat.title}
        </h1>
        {cat.teaser ? <p className="mt-4 max-w-2xl text-ink-muted">{cat.teaser}</p> : null}

        <ul className="mt-12 flex flex-col gap-3">
          {cat.subs.map((sub) => (
            <li key={sub.slug}>
              <Link
                href={`/services/${cat.slug}/${sub.slug}`}
                className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-5 py-4 text-base font-medium text-ink transition hover:border-accent/40 hover:bg-sand"
              >
                <span>{sub.title}</span>
                <span className="text-ink-muted">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <SiteFooter />
    </>
  );
}
