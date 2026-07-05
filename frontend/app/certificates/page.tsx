import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getApiBaseUrl, resolvePhotoUrl } from "@/lib/api/config";
import { fetchGiftCertificate } from "@/lib/api/site-settings";

export const metadata: Metadata = {
  title: "Сертификаты",
  description: "Подарочные сертификаты салона МАРКА АРЕНА.",
};

const DEFAULT_PAGE_TEXT =
  "Раздел в разработке: условия покупки и номиналы сертификатов добавим позже.";

export default async function CertificatesPage() {
  const settings = await fetchGiftCertificate();
  const apiBase = getApiBaseUrl();
  const photoSrc = resolvePhotoUrl(settings.photo_url, apiBase);
  const pageText = settings.page_text || DEFAULT_PAGE_TEXT;

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">Подарки</p>
        <h1 className="mt-3 text-3xl font-bold uppercase tracking-tight text-ink md:text-4xl">
          Сертификаты
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-start md:gap-14">
          {photoSrc ? (
            <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoSrc}
                alt="Подарочный сертификат"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          ) : null}

          <div className={photoSrc ? "" : "md:col-span-2"}>
            <p className="max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-ink-muted md:text-lg">
              {pageText}
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
