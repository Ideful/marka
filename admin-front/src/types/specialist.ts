export type DescriptionSection = {
  title: string;
  description: string;
};

import type { SpecialistClass } from "./specialist-class";

export type Specialist = {
  id: number;
  name: string;
  class: SpecialistClass;
  description: DescriptionSection[];
  photo_url: string;
};

export type SpecialistInput = {
  name: string;
  class: SpecialistClass;
  description: DescriptionSection[];
  photo_url: string;
};

export function emptySection(): DescriptionSection {
  return { title: "", description: "" };
}

export function normalizeSections(sections: DescriptionSection[]): DescriptionSection[] {
  return sections
    .map((s) => ({
      title: s.title.trim(),
      description: s.description.trim(),
    }))
    .filter((s) => s.title !== "" || s.description !== "");
}
