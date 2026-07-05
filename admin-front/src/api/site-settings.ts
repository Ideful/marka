import { apiFetch } from "./client";
import type {
  GiftCertificateSettings,
  HomepagePortfolioSettings,
} from "../types/homepage";

export type MarqueeSettings = {
  text: string;
};

export function getMarqueeSettings() {
  return apiFetch<MarqueeSettings>("/site-settings/marquee");
}

export function updateMarqueeSettings(text: string) {
  return apiFetch<MarqueeSettings>("/site-settings/marquee", {
    method: "PUT",
    body: JSON.stringify({ text }),
  });
}

export function getHomepagePortfolioSettings() {
  return apiFetch<HomepagePortfolioSettings>("/site-settings/homepage-portfolio");
}

export function updateHomepagePortfolioSettings(items: HomepagePortfolioSettings["items"]) {
  return apiFetch<HomepagePortfolioSettings>("/site-settings/homepage-portfolio", {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}

export function getGiftCertificateSettings() {
  return apiFetch<GiftCertificateSettings>("/site-settings/gift-certificate");
}

export function updateGiftCertificateSettings(data: GiftCertificateSettings) {
  return apiFetch<GiftCertificateSettings>("/site-settings/gift-certificate", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
