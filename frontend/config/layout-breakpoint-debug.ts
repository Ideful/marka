/**
 * Временная настройка: как отличать «мобильную» вёрстку от «десктопной»
 * (то же разделение, что у Tailwind `md`, по умолчанию 768px).
 *
 * - `media` — ширина окна ≥ `mdPx` → десктоп, иначе → мобилка.
 * - `force-mobile` — всегда мобильная вёрстка (дебаг на большом мониторе).
 * - `force-desktop` — всегда десктопная вёрстка.
 */
export type LayoutBreakpointMode = "media" | "force-mobile" | "force-desktop";

export const LAYOUT_BREAKPOINT_DEBUG: {
  mode: LayoutBreakpointMode;
  /** Должно совпадать с `theme.screens.md` в tailwind.config (по умолчанию 768). */
  mdPx: number;
} = {
  mode: "media",
  mdPx: 768,
};
