import { apiFetch } from "./client";

export type SeoPage = {
  key: string;
  path: string;
  label: string;
  parent_label?: string;
  meta_title: string;
  meta_description: string;
  has_custom: boolean;
};

export type SeoGroup = {
  id: string;
  label: string;
  pages: SeoPage[];
};

export type SeoListResponse = {
  groups: SeoGroup[];
};

export function listSeoPages() {
  return apiFetch<SeoListResponse>("/seo/pages");
}

export function updateSeoPage(
  key: string,
  data: { meta_title: string; meta_description: string },
) {
  return apiFetch<SeoPage>(`/seo/pages/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
