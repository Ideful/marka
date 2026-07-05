import Link from "next/link";
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
    <section
      id="certificates"
      className="scroll-mt-24 bg-sand px-4 py-16 md:px-6 md:py-24"
      aria-labelledby="certificates-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:gap-14">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          {photoSrc ? (
            <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
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

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 md:gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
                Подарки
              </p>
              <h2
                id="certificates-heading"
                className="text-3xl font-bold uppercase leading-tight tracking-tight text-ink md:text-4xl"
              >
                Подарочный
                <br />
                сертификат
              </h2>
            </div>

            <p className="whitespace-pre-wrap text-base leading-relaxed text-ink-muted md:text-lg">
              {teaserText}
            </p>

            <Link
              href="/certificates"
              className="inline-flex w-fit text-sm font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
            >
              Подробнее о сертификатах →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
