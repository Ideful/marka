import { HomeSection, homeMediaCardClass } from "@/components/home/HomeSection";
import { HOME_PAGE_SECTION_TONES } from "@/components/home/home-section-styles";
import { getApiBaseUrl, resolvePhotoUrl } from "@/lib/api/config";
import type { PortfolioItem } from "@/lib/api/site-settings";

type Props = {
  items: PortfolioItem[];
};

function PhotoPlaceholder() {
  return (
    <div
      className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink/15 bg-sand/50 text-center"
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
    <HomeSection
      id="portfolio"
      headingId="portfolio-heading"
      eyebrow="Работы"
      title="Портфолио"
      tone={HOME_PAGE_SECTION_TONES.portfolio}
      description={
        hasPhotos
          ? undefined
          : "Скоро здесь появятся фотографии наших работ — стрижки, окрашивания и укладки."
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {hasPhotos
          ? items.map((item, index) => {
              const src = resolvePhotoUrl(item.photo_url, apiBase);
              return (
                <figure key={`${item.photo_url}-${index}`} className={homeMediaCardClass}>
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={item.description || "Работа салона"}
                      className="aspect-[4/5] w-full object-cover transition duration-300 hover:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : (
                    <PhotoPlaceholder />
                  )}
                  {item.description ? (
                    <figcaption className="whitespace-pre-wrap px-4 py-3 text-center text-sm text-ink-muted">
                      {item.description}
                    </figcaption>
                  ) : null}
                </figure>
              );
            })
          : Array.from({ length: 3 }, (_, index) => <PhotoPlaceholder key={index} />)}
      </div>
    </HomeSection>
  );
}
