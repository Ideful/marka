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

/** Цены в рублях (целое число). 0 = не указано. */
export type TierPrices = Record<SpecialistTierKey, number>;

export type GenderedPrices = {
  female: TierPrices;
  male: TierPrices;
};

export function emptyGenderedPrices(): GenderedPrices {
  const tier: TierPrices = {
    master: 0,
    top_master: 0,
    stylist: 0,
    top_stylist: 0,
    art_director: 0,
  };
  return { female: { ...tier }, male: { ...tier } };
}

export function pricesHasValue(prices: GenderedPrices): boolean {
  return tierHasValue(prices.female) || tierHasValue(prices.male);
}

function tierHasValue(tier: TierPrices): boolean {
  return SPECIALIST_TIER_KEYS.some((key) => tier[key] > 0);
}

export function validateGenderedPrices(prices: GenderedPrices): string | null {
  for (const gender of ["female", "male"] as const) {
    for (const key of SPECIALIST_TIER_KEYS) {
      const value = prices[gender][key];
      if (!Number.isInteger(value) || value < 0) {
        return `Цена (${gender === "female" ? "жен." : "муж."}, ${SPECIALIST_TIER_LABELS[key]}) должна быть целым числом ≥ 0`;
      }
    }
  }
  if (!pricesHasValue(prices)) {
    return "Укажите хотя бы одну цену больше 0";
  }
  return null;
}

export function parsePriceInput(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === "") return 0;
  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits === "") return 0;
  const n = Number.parseInt(digits, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}
