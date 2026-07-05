import { getApiBaseUrl, resolvePhotoUrl } from "@/lib/api/config";
import type { PortfolioItem } from "@/lib/api/site-settings";

type Props = {
  items: PortfolioItem[];
};

function PhotoPlaceholder() {
  return (
    <div
      className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink/15 bg-sand/50 text-center"
      aria-hidden
    >
      <span className="text-2xl text-ink/20">◇</span>
      <span className="px-4 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
        Фото скоро
      </span>
    </div>
  );
}

export function PortfolioTeaser({ items }: Props) {
  const apiBase = getApiBaseUrl();
  const hasPhotos = items.some((item) => item.photo_url.trim() !== "");

  return (
    <section
      id="portfolio"
      className="scroll-mt-24 bg-white px-4 py-16 md:px-6 md:py-24"
      aria-labelledby="portfolio-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:gap-14">
        <div className="flex flex-col gap-2 md:gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
            Работы
          </p>
          <h2
            id="portfolio-heading"
            className="max-w-xl text-3xl font-bold uppercase leading-tight tracking-tight text-ink md:text-4xl"
          >
            Портфолио
          </h2>
          {!hasPhotos ? (
            <p className="max-w-2xl text-ink-muted">
              Скоро здесь появятся фотографии наших работ — стрижки, окрашивания и укладки.
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
          {hasPhotos
            ? items.map((item, index) => {
                const src = resolvePhotoUrl(item.photo_url, apiBase);
                return (
                  <figure
                    key={`${item.photo_url}-${index}`}
                    className="overflow-hidden rounded-xl border border-ink/10 bg-white"
                  >
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={item.description || "Работа салона"}
                        className="aspect-[4/5] w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <PhotoPlaceholder />
                    )}
                    {item.description ? (
                      <figcaption className="whitespace-pre-wrap px-3 py-2 text-sm text-ink-muted">
                        {item.description}
                      </figcaption>
                    ) : null}
                  </figure>
                );
              })
            : Array.from({ length: 6 }, (_, index) => <PhotoPlaceholder key={index} />)}
        </div>
      </div>
    </section>
  );
}
