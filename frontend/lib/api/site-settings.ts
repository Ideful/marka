import { getApiBaseUrl } from "@/lib/api/config";

export type MarqueeSettings = {
  text: string;
};

export type PortfolioItem = {
  photo_url: string;
  description: string;
};

export type HomepagePortfolioSettings = {
  items: PortfolioItem[];
};

export type GiftCertificateSettings = {
  photo_url: string;
  teaser_text: string;
  page_text: string;
};

const emptyPortfolio: HomepagePortfolioSettings = { items: [] };
const emptyGiftCertificate: GiftCertificateSettings = {
  photo_url: "",
  teaser_text: "",
  page_text: "",
};

async function fetchSiteSetting<T>(path: string, fallback: T): Promise<T> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchMarqueeText(): Promise<string> {
  const data = await fetchSiteSetting<MarqueeSettings>("/site-settings/marquee", { text: "" });
  return typeof data.text === "string" ? data.text.trim() : "";
}

export async function fetchHomepagePortfolio(): Promise<HomepagePortfolioSettings> {
  const data = await fetchSiteSetting<HomepagePortfolioSettings>(
    "/site-settings/homepage-portfolio",
    emptyPortfolio,
  );
  const items = Array.isArray(data.items)
    ? data.items
        .map((item) => ({
          photo_url: typeof item.photo_url === "string" ? item.photo_url.trim() : "",
          description: typeof item.description === "string" ? item.description.trim() : "",
        }))
        .filter((item) => item.photo_url !== "" || item.description !== "")
    : [];
  return { items };
}

export async function fetchGiftCertificate(): Promise<GiftCertificateSettings> {
  const data = await fetchSiteSetting<GiftCertificateSettings>(
    "/site-settings/gift-certificate",
    emptyGiftCertificate,
  );
  return {
    photo_url: typeof data.photo_url === "string" ? data.photo_url.trim() : "",
    teaser_text: typeof data.teaser_text === "string" ? data.teaser_text.trim() : "",
    page_text: typeof data.page_text === "string" ? data.page_text.trim() : "",
  };
}
