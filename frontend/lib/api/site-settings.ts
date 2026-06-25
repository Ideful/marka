import { getApiBaseUrl } from "@/lib/api/config";

export type MarqueeSettings = {
  text: string;
};

export async function fetchMarqueeText(): Promise<string> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/site-settings/marquee`, { cache: "no-store" });
    if (!res.ok) return "";
    const data = (await res.json()) as MarqueeSettings;
    return typeof data.text === "string" ? data.text.trim() : "";
  } catch {
    return "";
  }
}
