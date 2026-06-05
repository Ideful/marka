import type { SpecialistTierKey } from "@/data/price-tiers";
import { SPECIALIST_TIER_KEYS } from "@/data/price-tiers";

const rubFormatter = new Intl.NumberFormat("ru-RU");

/** Форматирует цену в рублях для отображения на сайте. */
export function formatPriceRub(value: number | undefined | null): string {
  if (value == null || value <= 0) return "—";
  return `${rubFormatter.format(value)} ₽`;
}

/** Для legacy-строк из статического service-tree. */
export function formatPriceDisplay(value: number | string | undefined | null): string {
  if (typeof value === "number") return formatPriceRub(value);
  if (typeof value === "string" && value.trim()) return value.trim();
  return "—";
}

export function normalizeTierPrices(raw: unknown): Record<SpecialistTierKey, number> {
  const empty = Object.fromEntries(
    SPECIALIST_TIER_KEYS.map((key) => [key, 0]),
  ) as Record<SpecialistTierKey, number>;

  if (!raw || typeof raw !== "object") return empty;

  for (const key of SPECIALIST_TIER_KEYS) {
    const v = (raw as Record<string, unknown>)[key];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
      empty[key] = Math.trunc(v);
      continue;
    }
    if (typeof v === "string") {
      const digits = v.replace(/[^\d]/g, "");
      empty[key] = digits ? Number.parseInt(digits, 10) : 0;
    }
  }

  return empty;
}

export function normalizeGenderedPrices(raw: unknown): {
  female: Record<SpecialistTierKey, number>;
  male: Record<SpecialistTierKey, number>;
} {
  if (!raw || typeof raw !== "object") {
    return {
      female: normalizeTierPrices(null),
      male: normalizeTierPrices(null),
    };
  }
  const obj = raw as { female?: unknown; male?: unknown };
  return {
    female: normalizeTierPrices(obj.female),
    male: normalizeTierPrices(obj.male),
  };
}
