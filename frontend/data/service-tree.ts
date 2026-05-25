import type { GenderedPrices } from "@/data/price-tiers";
import { uniformTierPrices } from "@/data/price-tiers";

/** Строка прайса: название, описание, цены по полу и уровню специалиста */
export type ServicePriceRow = {
  name: string;
  description?: string;
  prices: GenderedPrices;
};

export type ServiceSubcategory = {
  slug: string;
  title: string;
  description?: string;
  rows: ServicePriceRow[];
};

export type ServiceCategory = {
  slug: string;
  title: string;
  teaser?: string;
  subs: ServiceSubcategory[];
};

const U = "уточняйте у администратора";

/** Пример: стрижка — разные цены по полу и уровню */
const haircutExampleFemale = {
  master: "2 000 ₽",
  top_master: "2 500 ₽",
  stylist: "3 000 ₽",
  top_stylist: "3 500 ₽",
  art_director: "4 500 ₽",
} as const;

const haircutExampleMale = {
  master: "1 500 ₽",
  top_master: "1 900 ₽",
  stylist: "2 300 ₽",
  top_stylist: "2 700 ₽",
  art_director: "3 500 ₽",
} as const;

const haircutBlowFemale = {
  master: "3 500 ₽",
  top_master: "4 000 ₽",
  stylist: "4 500 ₽",
  top_stylist: "5 000 ₽",
  art_director: "6 000 ₽",
} as const;

const haircutBlowMale = {
  master: "2 800 ₽",
  top_master: "3 200 ₽",
  stylist: "3 600 ₽",
  top_stylist: "4 000 ₽",
  art_director: "5 000 ₽",
} as const;

/** Заготовка структуры; замените цены на финальные из прайса. */
export const SERVICE_TREE: ServiceCategory[] = [
  {
    slug: "hair",
    title: "Парикмахерский зал",
    teaser: "Стрижки, уход, укладки",
    subs: [
      {
        slug: "cuts",
        title: "Стрижки",
        description: "Женские и мужские стрижки.",
        rows: [
          {
            name: "Стрижка (пример)",
            description:
              "Модельная стрижка по длине и типу волос; точную стоимость уточняйте у мастера.",
            prices: {
              female: { ...haircutExampleFemale },
              male: { ...haircutExampleMale },
            },
          },
          {
            name: "Стрижка + укладка",
            description: "Стрижка и укладка феном или диффузором.",
            prices: {
              female: { ...haircutBlowFemale },
              male: { ...haircutBlowMale },
            },
          },
        ],
      },
      {
        slug: "color",
        title: "Окрашивание",
        rows: [
          {
            name: "Тонирование",
            prices: uniformTierPrices(U),
          },
        ],
      },
    ],
  },
  {
    slug: "brows-lashes",
    title: "Брови и ресницы",
    teaser: "Коррекция, ламинирование, наращивание",
    subs: [
      {
        slug: "brows",
        title: "Брови",
        rows: [{ name: "Коррекция / окрашивание", prices: uniformTierPrices(U) }],
      },
      {
        slug: "lashes",
        title: "Ресницы",
        rows: [{ name: "Ламинирование / наращивание", prices: uniformTierPrices(U) }],
      },
    ],
  },
  {
    slug: "makeup",
    title: "Макияж",
    teaser: "Дневной, вечерний, свадебный",
    subs: [
      {
        slug: "day-evening",
        title: "Образы",
        rows: [{ name: "Макияж", prices: uniformTierPrices(U) }],
      },
    ],
  },
  {
    slug: "manicure",
    title: "Маникюр",
    teaser: "Классический, аппаратный, покрытие",
    subs: [
      {
        slug: "classic",
        title: "Маникюр и покрытие",
        rows: [
          { name: "Маникюр классический", prices: uniformTierPrices(U) },
          { name: "Покрытие гель-лак", prices: uniformTierPrices(U) },
        ],
      },
    ],
  },
  {
    slug: "pedicure",
    title: "Педикюр",
    teaser: "Аппаратный и классический",
    subs: [
      {
        slug: "standard",
        title: "Педикюр",
        rows: [{ name: "Педикюр", prices: uniformTierPrices(U) }],
      },
    ],
  },
  {
    slug: "cosmetology",
    title: "Косметология",
    teaser: "Уходовые процедуры по назначению специалиста",
    subs: [
      {
        slug: "facial",
        title: "Уход за лицом",
        rows: [{ name: "Чистка / пилинг (пример)", prices: uniformTierPrices(U) }],
      },
    ],
  },
];
