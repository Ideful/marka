import { apiFetch } from "./client";

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
