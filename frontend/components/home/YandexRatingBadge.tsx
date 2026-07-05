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

  return (
    <div className="flex justify-center bg-white px-4 py-8 md:py-10">
      <a
        href={c.yandexReviewsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-4 rounded-2xl border border-ink/10 bg-sand/50 px-5 py-3.5 transition hover:border-accent/50 hover:bg-sand md:gap-5 md:px-6 md:py-4"
        aria-label={`Рейтинг ${formatRating(c.yandexRating)} на Яндекс.Картах — читать отзывы`}
      >
        <div className="flex items-center gap-2">
          <StarIcon />
          <span className="text-2xl font-semibold tabular-nums leading-none text-ink md:text-3xl">
            {formatRating(c.yandexRating)}
          </span>
        </div>

        <span className="h-10 w-px shrink-0 bg-ink/10" aria-hidden />

        <span className="flex flex-col gap-0.5 text-left">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-ink md:text-sm">
            Хорошее место
          </span>
          <span className="text-xs text-ink-muted transition group-hover:text-ink md:text-sm">
            Отзывы на Яндекс.Картах →
          </span>
        </span>
      </a>
    </div>
  );
}
