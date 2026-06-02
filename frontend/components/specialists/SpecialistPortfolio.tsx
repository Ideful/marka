import { getApiBaseUrl, resolvePhotoUrl } from "@/lib/api/config";
import type { PortfolioItem } from "@/lib/api/specialists";

type Props = {
  items: PortfolioItem[];
};

export function SpecialistPortfolio({ items }: Props) {
  if (!items.length) return null;
  const apiBase = getApiBaseUrl();

  return (
    <section className="mt-10">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink md:text-base">
        Портфолио
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map((item, idx) => {
          const src = resolvePhotoUrl(item.photo_url, apiBase);
          return (
            <figure
              key={`${item.photo_url}-${idx}`}
              className="overflow-hidden rounded-xl border border-ink/10 bg-white"
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={item.description || "Работа специалиста"}
                  className="aspect-[4/5] w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-sand text-sm text-ink-muted">
                  Фото скоро
                </div>
              )}
              {item.description ? (
                <figcaption className="whitespace-pre-wrap px-3 py-2 text-sm text-ink-muted">
                  {item.description}
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
