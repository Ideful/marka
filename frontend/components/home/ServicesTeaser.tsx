import Link from "next/link";
import {
  HomeSection,
  homeLightCardClass,
} from "@/components/home/HomeSection";
import { fetchMainServices, serviceDirectionHref } from "@/lib/api/services";

export async function ServicesTeaser() {
  let categories: Awaited<ReturnType<typeof fetchMainServices>> = [];
  try {
    categories = await fetchMainServices();
  } catch {
    categories = [];
  }

  return (
    <HomeSection
      id="services"
      headingId="services-heading"
      eyebrow="Услуги"
      title="Услуги и цены"
      tone="sand"
      footerAction={{ href: "/services", label: "Все разделы →" }}
    >
      {categories.length === 0 ? (
        <p className="text-center text-ink-muted">Каталог услуг скоро появится.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const href = cat.services.length > 0 ? serviceDirectionHref(cat) : null;

            if (!href) {
              return (
                <div key={cat.slug} className={`${homeLightCardClass} opacity-60`}>
                  <p className="text-lg font-semibold text-ink">{cat.name}</p>
                  <span className="mt-6 text-sm text-ink-muted">Скоро</span>
                </div>
              );
            }

            return (
              <Link key={cat.slug} href={href} className={homeLightCardClass}>
                <p className="text-lg font-semibold text-ink group-hover:text-accent">
                  {cat.name}
                </p>
                <span className="mt-6 text-sm font-medium text-ink-muted group-hover:text-ink">
                  Подробнее →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </HomeSection>
  );
}
