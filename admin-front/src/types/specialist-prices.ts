export const SPECIALIST_TOGGLE_KEYS = [
  "top_stylist",
  "stylist",
  "top_master",
  "master",
] as const;

export type SpecialistToggleKey = (typeof SPECIALIST_TOGGLE_KEYS)[number];

export const SPECIALIST_TOGGLE_LABELS: Record<SpecialistToggleKey, string> = {
  top_stylist: "Топ-стилист",
  stylist: "Стилист",
  top_master: "Топ-мастер",
  master: "Мастер",
};

export type SpecialistPrices = Record<SpecialistToggleKey, number>;

export function emptySpecialistPrices(): SpecialistPrices {
  return {
    top_stylist: 0,
    stylist: 0,
    top_master: 0,
    master: 0,
  };
}

export function specialistPricesHasValue(prices: SpecialistPrices): boolean {
  return SPECIALIST_TOGGLE_KEYS.some((key) => prices[key] > 0);
}

export function validateSpecialistPrices(prices: SpecialistPrices): string | null {
  for (const key of SPECIALIST_TOGGLE_KEYS) {
    const value = prices[key];
    if (!Number.isInteger(value) || value < 0) {
      return `Цена (${SPECIALIST_TOGGLE_LABELS[key]}) должна быть целым числом ≥ 0`;
    }
  }
  if (!specialistPricesHasValue(prices)) {
    return "Укажите хотя бы одну цену больше 0";
  }
  return null;
}
