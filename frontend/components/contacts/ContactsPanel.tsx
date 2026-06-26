import { salonConfig } from "@/lib/domain/salon-config";
import { YandexMap } from "@/components/maps/YandexMap";
import { MessengerLinks } from "@/components/contacts/MessengerLinks";

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

        <MessengerLinks />
      </div>
    </section>
  );
}
