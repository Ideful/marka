import { getApiBaseUrl } from "@/lib/api/config";
import type { SpecialistTierKey } from "@/data/price-tiers";
import type { LengthPrices } from "@/data/hair-lengths";
import { normalizeGenderedPrices } from "@/lib/format-price";
import { normalizeLengthPrices } from "@/data/hair-lengths";

export type ApiTierPrices = Record<SpecialistTierKey, number>;

export type ApiGenderedPrices = {
  female: ApiTierPrices;
  male: ApiTierPrices;
};

export type Service = {
  id: number;
  name: string;
  description: string;
  prices?: ApiGenderedPrices;
  length_prices?: LengthPrices;
  sort_order: number;
};

export type Section = {
  id: number;
  slug: string;
  name: string;
  description: string;
  services?: Service[];
};

export type MainService = {
  id: number;
  slug: string;
  name: string;
  services: Section[];
};

export type ServicePriceRow = {
  id?: number;
  name: string;
  description?: string;
  prices?: ApiGenderedPrices;
  length_prices?: LengthPrices;
};

export function serviceToPriceRow(service: Service): ServicePriceRow {
  return {
    id: service.id,
    name: service.name,
    description: service.description || undefined,
    prices: service.prices ? normalizeGenderedPrices(service.prices) : undefined,
    length_prices: service.length_prices ? normalizeLengthPrices(service.length_prices) : undefined,
  };
}

function normalizeMainService(raw: MainService): MainService {
  return {
    ...raw,
    services: Array.isArray(raw.services) ? raw.services : [],
  };
}

export function firstSectionSlug(main: Pick<MainService, "services">): string | null {
  const sections = Array.isArray(main.services) ? main.services : [];
  return sections[0]?.slug ?? null;
}

export function serviceDirectionHref(main: Pick<MainService, "slug" | "services">): string {
  const first = firstSectionSlug(main);
  if (first) return `/services/${main.slug}/${first}`;
  return `/services/${main.slug}`;
}

export async function fetchMainServices(): Promise<MainService[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/main-services`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API /main-services: ${res.status}`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error("API /main-services: expected array");
  return (data as MainService[]).map(normalizeMainService);
}

export async function fetchMainService(slug: string): Promise<MainService | null> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/main-services/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API /main-services/${slug}: ${res.status}`);
  return normalizeMainService((await res.json()) as MainService);
}

export async function fetchSection(
  mainSlug: string,
  sectionSlug: string,
): Promise<Section | null> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/main-services/${mainSlug}/sections/${sectionSlug}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`API /main-services/${mainSlug}/sections/${sectionSlug}: ${res.status}`);
  }
  return (await res.json()) as Section;
}

export const MAIN_SERVICE_SLUGS = [
  "hair",
  "nails",
  "brows-lashes",
  "cosmetology",
  "makeup",
] as const;

export const HAIR_SECTION_SLUGS = [
  "strizhka",
  "ukladka",
  "okrashivanie",
  "uhod-volos",
] as const;
