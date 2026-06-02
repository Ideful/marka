export type DescriptionSection = {
  title: string;
  description: string;
};

export type Portfolio = {
  photo_url: string;
  description: string;
};

import type { SpecialistClass } from "./specialist-class";

export type Specialist = {
  id: number;
  name: string;
  class: SpecialistClass;
  description: DescriptionSection[];
  portfolio: Portfolio[];
  photo_url: string;
};

export type SpecialistInput = {
  name: string;
  class: SpecialistClass;
  description: DescriptionSection[];
  portfolio: Portfolio[];
  photo_url: string;
};

export function emptySection(): DescriptionSection {
  return { title: "", description: "" };
}

export function emptyPortfolioItem(): Portfolio {
  return { photo_url: "", description: "" };
}

export function normalizeSections(sections: DescriptionSection[]): DescriptionSection[] {
  return sections
    .map((s) => ({
      title: s.title.trim(),
      description: s.description.trim(),
    }))
    .filter((s) => s.title !== "" || s.description !== "");
}

export function normalizePortfolio(items: Portfolio[]): Portfolio[] {
  return items
    .map((item) => ({
      photo_url: item.photo_url.trim(),
      description: item.description.trim(),
    }))
    .filter((item) => item.photo_url !== "" || item.description !== "");
}
