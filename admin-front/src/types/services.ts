import type { GenderedPrices } from "./price-tiers";
import type { LengthPrices } from "./length-prices";
import type { SpecialistPrices } from "./specialist-prices";
import type { Portfolio } from "./specialist";
import type { TableTemplate } from "./table-templates";

export type Service = {
  id: number;
  name: string;
  description: string;
  prices?: GenderedPrices;
  length_prices?: LengthPrices;
  specialist_prices?: SpecialistPrices;
  sort_order: number;
};

export type ServiceInput = {
  section_id: number;
  name: string;
  description: string;
  prices?: GenderedPrices;
  length_prices?: LengthPrices;
  specialist_prices?: SpecialistPrices;
  sort_order: number;
};

export type Section = {
  id: number;
  slug: string;
  name: string;
  description: string;
  table_template?: TableTemplate;
  template_version?: number;
  payload?: unknown;
  portfolio?: Portfolio[];
  services?: Service[];
};

export type MainService = {
  id: number;
  slug: string;
  name: string;
  services: Section[];
};
