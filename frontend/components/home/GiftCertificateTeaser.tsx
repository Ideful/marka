import Link from "next/link";
import { HomeSection, homeMediaCardClass } from "@/components/home/HomeSection";
import { HOME_PAGE_SECTION_TONES } from "@/components/home/home-section-styles";
import { getApiBaseUrl, resolvePhotoUrl } from "@/lib/api/config";
import type { GiftCertificateSettings } from "@/lib/api/site-settings";

type Props = {
  settings: GiftCertificateSettings;
};

const DEFAULT_TEASER_TEXT =
  "Подарите близким заботу о себе — визит в салон, уход за волосами или выбранную услугу.";

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
  const teaserText = settings.teaser_text || DEFAULT_TEASER_TEXT;

  return (
    <HomeSection
      id="certificates"
      headingId="certificates-heading"
      eyebrow="Подарки"
      title={
        <>
          Подарочный
          <br />
          сертификат
        </>
      }
      tone={HOME_PAGE_SECTION_TONES.certificates}
      narrow
    >
      <div className="flex flex-col gap-6">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-ink-muted md:text-lg">
          {teaserText}
        </p>

        <Link
          href="/certificates"
          className="inline-flex w-fit text-sm font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
        >
          Подробнее о сертификатах →
        </Link>

        {photoSrc ? (
          <div className={homeMediaCardClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSrc}
              alt="Подарочный сертификат"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        ) : (
          <PhotoPlaceholder />
        )}
      </div>
    </HomeSection>
  );
}
