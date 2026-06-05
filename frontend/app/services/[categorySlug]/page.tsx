import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchMainService, MAIN_SERVICE_SLUGS } from "@/lib/api/services";
import { SiteFooter } from "@/components/layout/SiteFooter";

type Props = { params: Promise<{ categorySlug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return MAIN_SERVICE_SLUGS.map((categorySlug) => ({ categorySlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const cat = await fetchMainService(categorySlug);
  if (!cat) return {};
  return {
    title: cat.name,
    description: `Услуги: ${cat.name}. Салон Марка Арена, Балашиха.`,
  };
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const cat = await fetchMainService(categorySlug);
  if (!cat) notFound();

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <nav className="text-sm text-ink-muted" aria-label="Хлебные крошки">
          <Link href="/services" className="hover:text-ink hover:underline">
            Услуги
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{cat.name}</span>
        </nav>

        <h1 className="mt-6 text-3xl font-bold uppercase tracking-tight text-ink md:text-4xl">
          {cat.name}
        </h1>

        {cat.services.length === 0 ? (
          <p className="mt-8 text-ink-muted">Типы услуг для этого направления скоро появятся.</p>
        ) : (
          <ul className="mt-12 flex flex-col gap-3">
            {cat.services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${cat.slug}/${service.slug}`}
                  className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-5 py-4 text-base font-medium text-ink transition hover:border-accent/40 hover:bg-sand"
                >
                  <span>{service.name}</span>
                  <span className="text-ink-muted">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <SiteFooter />
    </>
  );
}
