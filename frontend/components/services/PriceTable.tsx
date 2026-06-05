"use client";

import {
  SPECIALIST_TIER_KEYS,
  SPECIALIST_TIER_LABELS,
  type SpecialistTierKey,
} from "@/data/price-tiers";
import { formatPriceDisplay } from "@/lib/format-price";
import { Fragment, useId, useState } from "react";

export type PriceTableRow = {
  name: string;
  description?: string;
  prices: {
    female: Record<SpecialistTierKey, number | string>;
    male: Record<SpecialistTierKey, number | string>;
  };
};

export function PriceTable({ rows }: { rows: PriceTableRow[] }) {
  const selectId = useId();
  const [tier, setTier] = useState<SpecialistTierKey>(SPECIALIST_TIER_KEYS[0]);

  return (
    <div className="rounded-2xl border border-ink/10 bg-white">
      <div className="border-b border-ink/5 p-4 md:hidden">
        <label
          htmlFor={selectId}
          className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-muted"
        >
          Уровень специалиста
        </label>
        <div className="relative">
          <select
            id={selectId}
            value={tier}
            onChange={(e) => {
              const v = e.target.value;
              if ((SPECIALIST_TIER_KEYS as readonly string[]).includes(v)) {
                setTier(v as SpecialistTierKey);
              }
            }}
            className="w-full cursor-pointer appearance-none rounded-xl border border-ink/15 bg-sand px-4 py-3.5 pr-11 text-left text-sm font-semibold text-ink shadow-sm transition hover:border-ink/25 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          >
            {SPECIALIST_TIER_KEYS.map((key) => (
              <option key={key} value={key}>
                {SPECIALIST_TIER_LABELS[key]}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
            aria-hidden
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>

      <div className="hidden overflow-x-auto overscroll-x-contain touch-pan-x md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-sand/50 text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-medium">Услуга</th>
              <th className="whitespace-nowrap px-2 py-3 font-medium">Пол</th>
              {SPECIALIST_TIER_KEYS.map((key) => (
                <th key={key} className="whitespace-nowrap px-2 py-3 text-center font-medium">
                  {SPECIALIST_TIER_LABELS[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <Fragment key={`${row.name}-${index}`}>
                <tr className="border-b border-ink/5 bg-white">
                  <td className="px-4 py-4 align-top text-ink" rowSpan={2}>
                    <span className="font-medium">{row.name}</span>
                    {row.description ? (
                      <span className="mt-1 block text-xs font-normal leading-relaxed text-ink-muted">
                        {row.description}
                      </span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-ink-muted">Женщины</td>
                  {SPECIALIST_TIER_KEYS.map((key) => (
                    <td
                      key={key}
                      className="whitespace-nowrap px-2 py-3 text-center font-semibold text-ink"
                    >
                      {formatPriceDisplay(row.prices.female[key])}
                    </td>
                  ))}
                </tr>
                <tr
                  className={
                    index === rows.length - 1 ? "bg-sand/20" : "border-b border-ink/5 bg-sand/20"
                  }
                >
                  <td className="whitespace-nowrap px-2 py-3 text-ink-muted">Мужчины</td>
                  {SPECIALIST_TIER_KEYS.map((key) => (
                    <td
                      key={key}
                      className="whitespace-nowrap px-2 py-3 text-center font-semibold text-ink"
                    >
                      {formatPriceDisplay(row.prices.male[key])}
                    </td>
                  ))}
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col />
            <col style={{ width: "4.75rem" }} />
            <col style={{ width: "5.5rem" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-ink/10 bg-sand/50 text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-medium">Услуга</th>
              <th className="px-2 py-3 font-medium">Пол</th>
              <th className="px-2 py-3 text-right font-medium">Цена</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <Fragment key={`${row.name}-${index}-m`}>
                <tr className="border-b border-ink/5 bg-white">
                  <td className="px-4 py-4 align-top text-ink" rowSpan={2}>
                    <span className="font-medium leading-snug">{row.name}</span>
                    {row.description ? (
                      <span className="mt-1 block break-words text-xs font-normal leading-relaxed text-ink-muted">
                        {row.description}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-2 py-3 align-middle text-xs text-ink-muted">Жен.</td>
                  <td className="px-2 py-3 align-middle text-right text-sm font-semibold tabular-nums text-ink">
                    {formatPriceDisplay(row.prices.female[tier])}
                  </td>
                </tr>
                <tr
                  className={
                    index === rows.length - 1 ? "bg-sand/20" : "border-b border-ink/5 bg-sand/20"
                  }
                >
                  <td className="px-2 py-3 align-middle text-xs text-ink-muted">Муж.</td>
                  <td className="px-2 py-3 align-middle text-right text-sm font-semibold tabular-nums text-ink">
                    {formatPriceDisplay(row.prices.male[tier])}
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
