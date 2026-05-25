import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { salonConfig } from "@/lib/domain/salon-config";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-ink md:text-4xl">
          Политика конфиденциальности
        </h1>
        <p className="mt-6 text-sm text-ink-muted">
          Заготовка текста. Замените на юридически выверенную версию для {salonConfig.brandName}.
        </p>
        <div className="mt-10 max-w-none space-y-4 text-sm leading-relaxed text-ink-muted">
          <p>
            Настоящая политика описывает общие принципы обработки данных при использовании сайта.
            Уточните у юриста состав персональных данных, цели, сроки хранения и права субъектов в
            соответствии с 152-ФЗ и применимыми актами.
          </p>
          <p>
            Cookies могут использоваться для аналитики и улучшения работы сайта. Продолжая
            пользоваться сайтом после уведомления, посетитель подтверждает согласие с описанным
            порядком — после утверждения финального текста политики.
          </p>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
