import type { GenderedPrices } from "./price-tiers";
import type { LengthPrices } from "./length-prices";

export type SubService = {
  id: number;
  name: string;
  description: string;
  prices?: GenderedPrices;
  length_prices?: LengthPrices;
  sort_order: number;
};

export type SubServiceInput = {
  service_type_id: number;
  name: string;
  description: string;
  prices?: GenderedPrices;
  length_prices?: LengthPrices;
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
