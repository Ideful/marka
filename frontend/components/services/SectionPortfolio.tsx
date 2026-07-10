import { getApiBaseUrl, resolvePhotoUrl } from "@/lib/api/config";
import type { SectionPortfolioItem } from "@/lib/api/services";

type Props = {
  items: SectionPortfolioItem[];
};

export function SectionPortfolio({ items }: Props) {
  const apiBase = getApiBaseUrl();
  const visible = items.filter((item) => item.photo_url.trim() !== "");
  if (visible.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-center text-lg font-medium uppercase tracking-wide text-ink">
        Примеры работ
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {visible.map((item, index) => {
          const src = resolvePhotoUrl(item.photo_url, apiBase);
          if (!src) return null;
          return (
            <figure
              key={`${item.photo_url}-${index}`}
              className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={item.description || "Работа салона"}
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
              {item.description ? (
                <figcaption className="whitespace-pre-wrap px-3 py-2 text-center text-xs text-ink-muted">
                  {item.description}
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>
    </div>
  );
}
