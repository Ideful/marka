export const DEFAULT_SPECIALIST_TOGGLE_KEYS = [
  "top_stylist",
  "stylist",
  "top_master",
  "master",
] as const;

export const NAILS_SPECIALIST_TOGGLE_KEYS = [
  "master",
  "top_master",
  "leading_specialist",
  "instructor_expert",
] as const;

export const SPECIALIST_TOGGLE_KEYS = [
  ...DEFAULT_SPECIALIST_TOGGLE_KEYS,
  "leading_specialist",
  "instructor_expert",
] as const;

export type SpecialistToggleKey = (typeof SPECIALIST_TOGGLE_KEYS)[number];
export type DefaultSpecialistToggleKey = (typeof DEFAULT_SPECIALIST_TOGGLE_KEYS)[number];
export type NailsSpecialistToggleKey = (typeof NAILS_SPECIALIST_TOGGLE_KEYS)[number];

export const SPECIALIST_TOGGLE_LABELS: Record<SpecialistToggleKey, string> = {
  top_stylist: "Топ-стилист",
  stylist: "Стилист",
  top_master: "Топ-мастер",
  master: "Мастер",
  leading_specialist: "Ведущий специалист",
  instructor_expert: "Инструктор-эксперт",
};

export type SpecialistPrices = Partial<Record<SpecialistToggleKey, number>> & {
  top_stylist?: number;
  stylist?: number;
  top_master?: number;
  master?: number;
  leading_specialist?: number;
  instructor_expert?: number;
};

export function specialistToggleKeysForMain(mainSlug?: string): readonly SpecialistToggleKey[] {
  if (mainSlug === "nails") return NAILS_SPECIALIST_TOGGLE_KEYS;
  return DEFAULT_SPECIALIST_TOGGLE_KEYS;
}

export function emptySpecialistPrices(mainSlug?: string): SpecialistPrices {
  const keys = specialistToggleKeysForMain(mainSlug);
  const out: SpecialistPrices = {
    top_stylist: 0,
    stylist: 0,
    top_master: 0,
    master: 0,
    leading_specialist: 0,
    instructor_expert: 0,
  };
  for (const key of keys) {
    out[key] = 0;
  }
  return out;
}

export function normalizeSpecialistPrices(
  prices: SpecialistPrices | undefined,
  mainSlug?: string,
): SpecialistPrices {
  const keys = specialistToggleKeysForMain(mainSlug);
  const out: SpecialistPrices = {};
  for (const key of keys) {
    const value = prices?.[key];
    out[key] = typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : 0;
  }
  return out;
}

export function specialistPricesHasValue(
  prices: SpecialistPrices,
  mainSlug?: string,
): boolean {
  return specialistToggleKeysForMain(mainSlug).some((key) => (prices[key] ?? 0) > 0);
}

export function validateSpecialistPrices(
  prices: SpecialistPrices,
  mainSlug?: string,
): string | null {
  for (const key of specialistToggleKeysForMain(mainSlug)) {
    const value = prices[key] ?? 0;
    if (!Number.isInteger(value) || value < 0) {
      return `Цена (${SPECIALIST_TOGGLE_LABELS[key]}) должна быть целым числом ≥ 0`;
    }
  }
  if (!specialistPricesHasValue(prices, mainSlug)) {
    return "Укажите хотя бы одну цену больше 0";
  }
  return null;
}
