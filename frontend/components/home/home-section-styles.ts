/** Общие классы секций главной: фоны, отступы, типографика заголовков. */

export type HomeSectionTone = "light" | "sand" | "dark";

export const homeSectionShellClass = "scroll-mt-24 px-4 py-16 md:px-6 md:py-24";

/** Меньший верхний отступ — когда секция идёт сразу после блока того же фона. */
export const homeSectionShellFlushTopClass =
  "scroll-mt-24 px-4 pt-6 pb-16 md:px-6 md:pt-8 md:pb-24";

/** Компактная полоса между hero и первой полноценной секцией (бейдж рейтинга). */
export const homeSectionStripeClass = "scroll-mt-24 px-4 py-6 md:px-6 md:py-8";

type ToneStyle = {
  section: string;
  eyebrow: string;
  title: string;
  description: string;
  link: string;
};

export const homeSectionToneStyles: Record<HomeSectionTone, ToneStyle> = {
  light: {
    section: "bg-white text-ink",
    eyebrow: "text-ink-muted",
    title: "text-ink",
    description: "text-ink-muted",
    link: "text-ink hover:text-accent",
  },
  sand: {
    section: "bg-sand text-ink",
    eyebrow: "text-ink-muted",
    title: "text-ink",
    description: "text-ink-muted",
    link: "text-ink hover:text-accent",
  },
  dark: {
    section: "bg-ink text-white",
    eyebrow: "text-white/55",
    title: "text-white",
    description: "text-white/70",
    link: "text-white/70 hover:text-white",
  },
};

/** Чередование фонов на главной (hero и footer — отдельно). */
export const HOME_PAGE_SECTION_TONES = {
  yandex: "sand",
  philosophy: "light",
  services: "sand",
  portfolio: "light",
  certificates: "sand",
  specialists: "light",
  vacancies: "sand",
  contacts: "light",
} as const satisfies Record<string, HomeSectionTone>;

export function homeSectionClass(tone: HomeSectionTone, compact = false): string {
  const shell = compact ? homeSectionStripeClass : homeSectionShellClass;
  return `${shell} ${homeSectionToneStyles[tone].section}`;
}

export const homeLightCardClass =
  "group flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition hover:border-accent/40 hover:shadow-md";

export const homeLightRowCardClass =
  "group flex items-center justify-between rounded-2xl border border-ink/10 bg-white px-6 py-5 shadow-sm transition hover:border-accent/40 hover:shadow-md";

export const homeDarkCardClass =
  "group flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-6 py-5 transition hover:border-accent/50 hover:bg-white/10";

export const homeMediaCardClass =
  "overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm";
