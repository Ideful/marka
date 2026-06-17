export const HAIR_LENGTH_KEYS = ["short", "medium", "long"] as const;

export type HairLengthKey = (typeof HAIR_LENGTH_KEYS)[number];

export const HAIR_LENGTH_LABELS: Record<HairLengthKey, string> = {
  short: "Короткие",
  medium: "Средние",
  long: "Длинные",
};

export type LengthPrices = Record<HairLengthKey, number>;

export function emptyLengthPrices(): LengthPrices {
  return { short: 0, medium: 0, long: 0 };
}

export function lengthPricesHasValue(prices: LengthPrices): boolean {
  return HAIR_LENGTH_KEYS.some((key) => prices[key] > 0);
}

export function validateLengthPrices(prices: LengthPrices): string | null {
  for (const key of HAIR_LENGTH_KEYS) {
    const value = prices[key];
    if (!Number.isInteger(value) || value < 0) {
      return `Цена (${HAIR_LENGTH_LABELS[key]}) должна быть целым числом ≥ 0`;
    }
  }
  return null;
}
