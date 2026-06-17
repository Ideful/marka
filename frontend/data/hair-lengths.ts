export const HAIR_LENGTH_KEYS = ["short", "medium", "long"] as const;

export type HairLengthKey = (typeof HAIR_LENGTH_KEYS)[number];

export const HAIR_LENGTH_LABELS: Record<HairLengthKey, string> = {
  short: "Короткие",
  medium: "Средние",
  long: "Длинные",
};

export type LengthPrices = Record<HairLengthKey, number>;

export function normalizeLengthPrices(raw: unknown): LengthPrices {
  const empty: LengthPrices = { short: 0, medium: 0, long: 0 };
  if (!raw || typeof raw !== "object") return empty;

  for (const key of HAIR_LENGTH_KEYS) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      empty[key] = Math.trunc(value);
    }
  }

  return empty;
}

export function lengthPricesHasValue(prices: LengthPrices): boolean {
  return HAIR_LENGTH_KEYS.some((key) => prices[key] > 0);
}
