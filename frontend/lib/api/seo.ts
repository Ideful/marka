import { getApiBaseUrl } from "@/lib/api/config";

export type SeoPageMeta = {
  key: string;
  path: string;
  label: string;
  meta_title: string;
  meta_description: string;
  has_custom: boolean;
};

export async function fetchSeoByPath(path: string): Promise<SeoPageMeta | null> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(
      `${base}/seo/by-path?path=${encodeURIComponent(path)}`,
      { cache: "no-store" },
    );
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as SeoPageMeta;
  } catch {
    return null;
  }
}

/** Возвращает title/description из SEO, если заполнены; иначе fallback. */
export async function resolvePageSeo(
  path: string,
  fallback: { title?: string; description?: string },
): Promise<{ title?: string; description?: string }> {
  const seo = await fetchSeoByPath(path);
  if (!seo) return fallback;
  return {
    title: seo.meta_title.trim() || fallback.title,
    description: seo.meta_description.trim() || fallback.description,
  };
}
