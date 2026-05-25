/** Ключи уровней специалиста (совпадают с JSON API) */
export const SPECIALIST_TIER_KEYS = [
  "master",
  "top_master",
  "stylist",
  "top_stylist",
  "art_director",
] as const;

export type SpecialistTierKey = (typeof SPECIALIST_TIER_KEYS)[number];

export const SPECIALIST_TIER_LABELS: Record<SpecialistTierKey, string> = {
  master: "Мастер",
  top_master: "Топ-мастер",
  stylist: "Стилист",
  top_stylist: "Топ-стилист",
  art_director: "Арт-директор",
};

export type TierPrices = Record<SpecialistTierKey, string>;

export type GenderedPrices = {
  female: TierPrices;
  male: TierPrices;
};

/** Одна цена для всех ячеек (например «уточняйте у администратора») */
export function uniformTierPrices(value: string): GenderedPrices {
  const tier: TierPrices = {
    master: value,
    top_master: value,
    stylist: value,
    top_stylist: value,
    art_director: value,
  };
  return { female: { ...tier }, male: { ...tier } };
}
