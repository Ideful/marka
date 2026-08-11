import Link from "next/link";
import { HomeSection, homeMediaCardClass } from "@/components/home/HomeSection";
import { HOME_PAGE_SECTION_TONES } from "@/components/home/home-section-styles";
import { getApiBaseUrl, resolvePhotoUrl } from "@/lib/api/config";
import type { GiftCertificateSettings } from "@/lib/api/site-settings";

type Props = {
  settings: GiftCertificateSettings;
};

const CERTIFICATES_BUY_URL = "https://o16253.yclients.com/certificates";

function PhotoPlaceholder() {
  return (
    <div
      className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-white text-center shadow-sm"
      aria-hidden
    >
      <span className="text-3xl text-ink/20">◇</span>
      <span className="px-6 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
        Фото сертификата скоро
      </span>
    </div>
  );
}

export function GiftCertificateTeaser({ settings }: Props) {
  const apiBase = getApiBaseUrl();
  const photoSrc = resolvePhotoUrl(settings.photo_url, apiBase);

  return (
    <HomeSection
      id="certificates"
      headingId="certificates-heading"
      eyebrow="Подарки"
      title={
        <span className="font-normal normal-case">
          Сертификаты
        </span>
      }
      tone={HOME_PAGE_SECTION_TONES.certificates}
      narrow
    >
      <div className="flex flex-col gap-6">
        {photoSrc ? (
          <a href={CERTIFICATES_BUY_URL} target="_blank" rel="noopener noreferrer" className={homeMediaCardClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSrc}
              alt="Подарочный сертификат"
              className="aspect-[4/3] w-full object-cover"
            />
          </a>
        ) : (
          <PhotoPlaceholder />
        )}
        <h2 className="text-2xl font-normal leading-tight tracking-tight text-ink md:text-3xl">
          Подарочные сертификаты
        </h2>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-ink-muted md:text-lg">
          Ищете подарок, который точно понравится? Подарочный сертификат в наш салон - это
          возможность подарить заботу, красоту и время для себя.
        </p>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-ink-muted md:text-lg">
          Сертификат можно использовать на любые услуги салона: парикмахерские услуги,
          окрашивание, уходы, маникюр, педикюр, косметологию и другие процедуры.
        </p>

        <h2 className="text-2xl font-normal leading-tight tracking-tight text-ink md:text-3xl">
          Доступные номиналы
        </h2>
        <ul className="space-y-1 text-base leading-relaxed text-ink-muted md:text-lg">
          <li>🎁 1 500 ₽</li>
          <li>🎁 3 000 ₽</li>
          <li>🎁 5 000 ₽</li>
          <li>🎁 10 000 ₽</li>
          <li>🎁 15 000 ₽</li>
        </ul>

        <Link
          href={CERTIFICATES_BUY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit text-sm font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
        >
          Приобрести Сертификат →
        </Link>
      </div>
    </HomeSection>
  );
}
