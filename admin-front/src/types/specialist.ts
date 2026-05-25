export type DescriptionSection = {
  title: string;
  description: string;
};

export type Specialist = {
  id: number;
  name: string;
  description: DescriptionSection[];
  photo_url: string;
};

export type SpecialistInput = {
  name: string;
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
