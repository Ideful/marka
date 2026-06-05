import { getApiBaseUrl } from "@/lib/api/config";
import type { SpecialistTierKey } from "@/data/price-tiers";
import { normalizeGenderedPrices } from "@/lib/format-price";

export type ApiTierPrices = Record<SpecialistTierKey, number>;

export type ApiGenderedPrices = {
  female: ApiTierPrices;
  male: ApiTierPrices;
};

export type SubService = {
  id: number;
  name: string;
  description: string;
  prices: ApiGenderedPrices;
  sort_order: number;
};

export type ServiceType = {
  id: number;
  slug: string;
  name: string;
  description: string;
  sub_services?: SubService[];
};

export type MainService = {
  id: number;
  slug: string;
  name: string;
  services: ServiceType[];
};

export type ServicePriceRow = {
  id?: number;
  name: string;
  description?: string;
  prices: ApiGenderedPrices;
};

export function subServiceToPriceRow(sub: SubService): ServicePriceRow {
  return {
    id: sub.id,
    name: sub.name,
    description: sub.description || undefined,
    prices: normalizeGenderedPrices(sub.prices),
  };
}

export async function fetchMainServices(): Promise<MainService[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/main-services`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API /main-services: ${res.status}`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error("API /main-services: expected array");
  return data as MainService[];
}

export async function fetchMainService(slug: string): Promise<MainService | null> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/main-services/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API /main-services/${slug}: ${res.status}`);
  return (await res.json()) as MainService;
}

export async function fetchServiceType(
  mainSlug: string,
  serviceSlug: string,
): Promise<ServiceType | null> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/main-services/${mainSlug}/services/${serviceSlug}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`API /main-services/${mainSlug}/services/${serviceSlug}: ${res.status}`);
  }
  return (await res.json()) as ServiceType;
}

/** Слаги 5 направлений — совпадают с backend seed. */
export const MAIN_SERVICE_SLUGS = [
  "hair",
  "nails",
  "brows-lashes",
  "cosmetology",
  "makeup",
] as const;

/** Типы услуг парикмахерского направления (пока только они на фронте). */
export const HAIR_SERVICE_SLUGS = [
  "strizhka",
  "ukladka",
  "okrashivanie",
  "barber",
  "uhod-volos",
  "transform",
] as const;
