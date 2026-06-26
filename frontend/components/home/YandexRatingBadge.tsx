import { salonConfig } from "@/lib/domain/salon-config";

export function YandexRatingBadge() {
  return (
    <div className="flex justify-center bg-white px-4 py-5">
      <iframe
        src={salonConfig.yandexRatingBadgeEmbedSrc}
        width={150}
        height={50}
        title="Рейтинг на Яндексе"
        className="border-0"
      />
    </div>
  );
}
