import {
  HOME_PAGE_SECTION_TONES,
  homeSectionClass,
} from "@/components/home/home-section-styles";
import { salonConfig } from "@/lib/domain/salon-config";

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-5 w-5 shrink-0 text-accent"
      fill="currentColor"
    >
      <path d="M12 2l2.89 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 7.11-1.01L12 2z" />
    </svg>
  );
}

function formatRating(value: number): string {
  return value.toLocaleString("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function YandexRatingBadge() {
  const c = salonConfig;
  const tone = HOME_PAGE_SECTION_TONES.yandex;

  return (
    <div className={`flex w-full items-center justify-center ${homeSectionClass(tone, true)}`}>
      <a
        href={c.yandexReviewsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group mx-auto inline-flex items-center justify-center gap-4 rounded-2xl border border-ink/10 bg-white px-5 py-3.5 text-ink shadow-sm transition hover:border-accent/50 hover:shadow-md md:gap-5 md:px-6 md:py-4"
        aria-label={`Рейтинг ${formatRating(c.yandexRating)} — о нас на Яндекс.Картах`}
      >
        <div className="flex items-center gap-2">
          <StarIcon />
          <span className="text-2xl font-semibold tabular-nums leading-none md:text-3xl">
            {formatRating(c.yandexRating)}
          </span>
        </div>

        <span className="h-10 w-px shrink-0 bg-ink/10" aria-hidden />

        <span className="flex flex-col gap-0.5 text-center sm:text-left">
          <span className="text-sm font-semibold md:text-base">О нас на Яндекс.Картах</span>
          <span className="text-xs text-ink-muted transition group-hover:text-ink md:text-sm">
            Читать отзывы →
          </span>
        </span>
      </a>
    </div>
  );
}
