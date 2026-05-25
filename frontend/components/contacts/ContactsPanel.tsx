import { salonConfig } from "@/lib/domain/salon-config";
import { YandexMap } from "@/components/maps/YandexMap";
import { ButtonLink } from "@/components/ui/ButtonLink";

type Props = {
  /** Если false — без верхнего заголовка секции (на странице «Контакты») */
  showEyebrow?: boolean;
};

export function ContactsPanel({ showEyebrow = true }: Props) {
  const c = salonConfig;
  return (
    <section
      id="contacts"
      className="scroll-mt-24 bg-white px-4 py-16 md:px-6 md:py-24"
      aria-labelledby="contacts-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:gap-14">
        <div className="flex flex-col gap-2 text-center md:gap-3">
          {showEyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
              Контакты
            </p>
          ) : null}
          <h2
            id="contacts-heading"
            className="text-balance text-2xl font-bold uppercase leading-tight tracking-tight text-ink md:text-4xl"
          >
            {c.hoursTitle}
            <br />
            {c.hoursDetail}
          </h2>
        </div>

        <YandexMap embedSrc={c.yandexMapEmbedSrc} title="Салон на карте Балашихи" />

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-base text-ink">{c.addressLine}</p>
          <a
            href={`tel:${c.phoneTel}`}
            className="text-lg font-semibold text-ink hover:text-accent"
          >
            {c.phoneDisplay}
          </a>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-6">
          <ButtonLink href={c.whatsappUrl} variant="outline" size="lg" target="_blank" rel="noopener noreferrer">
            WhatsApp
          </ButtonLink>
          <ButtonLink href={c.telegramUrl} variant="outline" size="lg" target="_blank" rel="noopener noreferrer">
            Telegram
          </ButtonLink>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <a
            href={c.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Инстаграм
          </a>
          <a
            href={c.yandexMapExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Яндекс-карты
          </a>
        </div>
      </div>
    </section>
  );
}
