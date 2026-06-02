/** Ключи уровня специалиста (как в frontend/data/price-tiers.ts и API поле class). */
export const SPECIALIST_CLASS_KEYS = [
  "master",
  "top_master",
  "stylist",
  "top_stylist",
  "art_director",
] as const;

export type SpecialistClass = (typeof SPECIALIST_CLASS_KEYS)[number];

export const SPECIALIST_CLASS_LABELS: Record<SpecialistClass, string> = {
  master: "Мастер",
  top_master: "Топ-мастер",
  stylist: "Стилист",
  top_stylist: "Топ-стилист",
  art_director: "Арт-директор",
};

export const DEFAULT_SPECIALIST_CLASS: SpecialistClass = "master";

export function isSpecialistClass(value: string): value is SpecialistClass {
  return (SPECIALIST_CLASS_KEYS as readonly string[]).includes(value);
}

export function specialistClassLabel(classKey: string): string {
  if (isSpecialistClass(classKey)) return SPECIALIST_CLASS_LABELS[classKey];
  return classKey || "—";
}
