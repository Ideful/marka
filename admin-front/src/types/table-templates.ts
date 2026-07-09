export type TableTemplate =
  | "rank_gender_matrix"
  | "rank_variant_matrix"
  | "service_length_matrix"
  | "service_single_price_by_specialist"
  | "service_rank_matrix_grouped"
  | "service_single_rank_matrix";

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
  day: "Дневная",
  evening: "Вечерняя",
};

export const LENGTH_LABELS: Record<string, string> = {
  short: "Короткие",
  medium: "Средние",
  long: "Длинные",
};

export function usesServiceRows(template?: TableTemplate): boolean {
  return template === "service_single_price_by_specialist";
}

export function usesSectionPayload(template?: TableTemplate): boolean {
  return Boolean(template && !usesServiceRows(template));
}

export function rankLabel(key: string): string {
  return RANK_LABELS[key] ?? key;
}
