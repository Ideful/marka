import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Сертификаты",
  description: "Подарочные сертификаты салона МАРКА АРЕНА.",
};

export default function CertificatesPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">Подарки</p>
        <h1 className="mt-3 text-3xl font-bold uppercase tracking-tight text-ink md:text-4xl">
          Сертификаты
        </h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Раздел в разработке: условия покупки и номиналы сертификатов добавим позже.
        </p>
      </div>
      <SiteFooter />
    </>
  );
}
