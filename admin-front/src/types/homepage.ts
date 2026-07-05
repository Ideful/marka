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

export function emptyPortfolioItem(): PortfolioItem {
  return { photo_url: "", description: "" };
}

export function normalizePortfolio(items: PortfolioItem[]): PortfolioItem[] {
  return items
    .map((item) => ({
      photo_url: item.photo_url.trim(),
      description: item.description.trim(),
    }))
    .filter((item) => item.photo_url !== "" || item.description !== "");
}
