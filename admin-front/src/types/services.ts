import type { GenderedPrices } from "./price-tiers";
import type { LengthPrices } from "./length-prices";

export type Service = {
  id: number;
  name: string;
  description: string;
  prices?: GenderedPrices;
  length_prices?: LengthPrices;
  sort_order: number;
};

export type ServiceInput = {
  section_id: number;
  name: string;
  description: string;
  prices?: GenderedPrices;
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
