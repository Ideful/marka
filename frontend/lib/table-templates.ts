import type { HairLengthKey } from "@/data/hair-lengths";
import type { SpecialistTierKey } from "@/data/price-tiers";

export type TableTemplate =
  | "rank_gender_matrix"
  | "rank_variant_matrix"
  | "service_length_matrix"
  | "service_single_price_by_specialist"
  | "service_rank_matrix_grouped"
  | "service_single_rank_matrix";

export type NullablePrice = number | null;

export type RankGenderPayload = {
  rows: Array<{
    rank: string;
    prices: { female: NullablePrice; male: NullablePrice };
  }>;
};

export type RankVariantPayload = {
  variants: string[];
  rows: Array<{
    rank: string;
    prices: Record<string, NullablePrice>;
  }>;
};

export type ServiceLengthPayload = {
  rows: Array<{
    service_slug: string;
    service_name: string;
    prices: Record<HairLengthKey, NullablePrice>;
  }>;
};

export type ServiceRankMatrixGroupedPayload = {
  groups: Array<{
    group_slug: string;
    group_title: string;
    columns: string[];
    rows: Array<{
      service_slug: string;
      service_name: string;
      prices: Record<string, NullablePrice>;
    }>;
  }>;
};

export type ServiceSingleRankPayload = {
  columns: Array<{ key: string; label: string }>;
  rows: Array<{
    service_slug: string;
    service_name: string;
    prices: Record<string, NullablePrice>;
  }>;
};

export const RANK_LABELS: Record<string, string> = {
  art_director: "Арт-директор",
  top_stylist: "Топ-стилист",
  stylist: "Стилист",
  top_master: "Топ-мастер",
  master: "Мастер",
  barber: "Барбер",
  makeup_artist: "Визажист",
  top_makeup_artist: "Топ-визажист",
};

export const VARIANT_LABELS: Record<string, string> = {
  day: "Укладка дневная",
  evening: "Укладка вечерняя",
};

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

export const STRIZHKA_RANK_ORDER = [
  "art_director",
  "top_stylist",
  "stylist",
  "top_master",
  "master",
  "barber",
] as const;

export const UKLADKA_RANK_ORDER = [
  "top_stylist",
  "stylist",
  "top_master",
  "master",
  "barber",
] as const;

export function rankLabel(key: string): string {
  return RANK_LABELS[key] ?? key;
}

export function parsePayload<T>(raw: unknown, fallback: T): T {
  if (!raw || typeof raw !== "object") return fallback;
  return raw as T;
}

export function nullablePrice(value: unknown): NullablePrice {
  if (value === null) return null;
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }
  return null;
}

export function specialistPriceValue(
  raw: Record<string, unknown> | undefined,
  key: SpecialistTierKey | SpecialistToggleKey,
): number {
  if (!raw) return 0;
  const value = raw[key];
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }
  return 0;
}
