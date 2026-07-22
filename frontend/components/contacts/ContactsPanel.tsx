import { salonConfig } from "@/lib/domain/salon-config";
import { YandexMap } from "@/components/maps/YandexMap";
import { MessengerLinks } from "@/components/contacts/MessengerLinks";
import {
  homeSectionShellClass,
  homeSectionToneStyles,
  type HomeSectionTone,
} from "@/components/home/home-section-styles";

type Props = {
  /** Если false — без видимого заголовка «Контакты» */
  showEyebrow?: boolean;
  tone?: HomeSectionTone;
};

export function ContactsPanel({ showEyebrow = true, tone = "light" }: Props) {
  const c = salonConfig;
  const styles = homeSectionToneStyles[tone];

  return (
    <section
      id="contacts"
      className={`${homeSectionShellClass} ${styles.section}`}
      aria-labelledby="contacts-heading"
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-8 text-center md:gap-10">
        <div className="flex flex-col gap-3 md:gap-4">
          <h2
            id="contacts-heading"
            className={
              showEyebrow
                ? `text-2xl font-bold uppercase tracking-tight md:text-4xl ${styles.title}`
                : "sr-only"
            }
          >
            Контакты
          </h2>
          <p
            className={`text-balance text-base font-medium uppercase leading-snug tracking-wide md:text-xl ${styles.title}`}
          >
            {c.hoursTitle}
            <br />
            {c.hoursDetail}
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-4">
          <a
            href={`tel:${c.phoneTel}`}
            className="inline-flex w-full max-w-xs items-center justify-center rounded-full bg-ink px-10 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-ink/90 md:max-w-sm md:text-base"
          >
            Позвонить
          </a>
          <a
            href={`tel:${c.phoneTel}`}
            className="text-base font-medium text-ink underline underline-offset-4 transition hover:text-accent md:text-lg"
          >
            {c.phoneDisplay}
          </a>
        </div>

        <p className="text-base text-ink md:text-lg">{c.addressLine}</p>

        <div className="w-full max-w-6xl">
          <YandexMap embedSrc={c.yandexMapEmbedSrc} title="Салон на карте Балашихи" />
        </div>

        <MessengerLinks />
      </div>
    </section>
  );
}
