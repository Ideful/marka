/**
 * Центральная конфигурация салона: контакты и внешние ссылки.
 * Подставьте URL онлайн-записи, когда будет готов.
 */
export class SalonConfig {
  readonly brandName = "МАРКА АРЕНА";
  readonly tagline = "Салон красоты в Балашихе";

  readonly philosophy = {
    label: "Наша философия",
    title: "Делать вашу жизнь лучше",
    paragraphs: [
      "Мы верим, что забота о себе — это не роскошь, а часть полноценной жизни. Каждый визит в салон должен оставлять ощущение, что с вами позаботились по-настоящему.",
      "Волосы для нас — не просто услуга. Это то, с чем вы живёте каждый день: уверенность, настроение, ощущение себя. Поэтому мы относимся к каждой стрижке, окрашиванию и укладке с вниманием к деталям.",
      "В «Марке» мы создаём пространство, где можно расслабиться, довериться мастеру и выйти чуть счастливее, чем вошли.",
    ],
  } as const;

  readonly addressLine = "г. Балашиха, улица Парковая, 2";
  readonly geo = { lat: 55.796391, lng: 37.938271 } as const;

  readonly phoneDisplay = "+7 (985) 999-01-88";
  readonly phoneTel = "+79859990188";

  readonly hoursTitle = "Ежедневно";
  readonly hoursDetail = "с 10:00 до 21:00";

  /** iframe Яндекс.Карт — как на текущем сайте */
  readonly yandexMapEmbedSrc =
    "https://yandex.ru/map-widget/v1/-/CLdkIQkg?scroll=false";

  readonly yandexMapExternalUrl = "https://yandex.ru/maps/-/CLdkIQkg";

  readonly whatsappUrl = "https://wa.me/79859990188";
  readonly telegramUrl = "https://t.me/Marque_arena";
  readonly instagramUrl = "https://www.instagram.com/marque_arena";

  readonly yclientsUrl =
    "https://n717666.yclients.com/company/677152/personal/menu?o=";

  /** Задайте `NEXT_PUBLIC_BOOKING_URL` или используется YClients */
  get bookingUrl(): string {
    const env = process.env.NEXT_PUBLIC_BOOKING_URL;
    return env && env.length > 0 ? env : this.yclientsUrl;
  }

  siteUrl(): string {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    }
    return "https://marque.love";
  }
}

export const salonConfig = new SalonConfig();
