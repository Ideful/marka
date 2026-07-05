"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  SPECIALIST_TIER_KEYS,
  SPECIALIST_TIER_LABELS,
  type SpecialistTierKey,
} from "@/data/price-tiers";
import type { MainService, ServicePriceRow, ServiceType } from "@/lib/api/services";
import { formatPriceDisplay } from "@/lib/format-price";
import { ServiceTypeShell } from "@/components/services/ServiceTypeShell";

const BOOKING_URL = "https://n717666.yclients.com/company/677152/personal/menu?o=";

type Props = {
  main: MainService;
  service: ServiceType;
  rows: ServicePriceRow[];
};

export function ServiceTypeView({ main, service, rows }: Props) {
  const selectId = useId();
  const [tier, setTier] = useState<SpecialistTierKey>("art_director");

  const description =
    service.description?.trim() ||
    rows.find((r) => r.description?.trim())?.description?.trim() ||
    "Точную стоимость и состав услуги уточняйте у администратора или мастера.";

  return (
    <ServiceTypeShell main={main} service={service}>
      <div className="space-y-8">
      <div className="relative">
        <label htmlFor={selectId} className="sr-only">
          Уровень специалиста
        </label>
        <select
          id={selectId}
          value={tier}
          onChange={(e) => {
            const v = e.target.value;
            if ((SPECIALIST_TIER_KEYS as readonly string[]).includes(v)) {
              setTier(v as SpecialistTierKey);
            }
          }}
          className="w-full cursor-pointer appearance-none rounded-xl border border-ink/20 bg-white px-4 py-3.5 pr-12 text-center text-sm font-medium uppercase tracking-wide text-ink shadow-sm transition hover:border-ink/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        >
          {SPECIALIST_TIER_KEYS.map((key) => (
            <option key={key} value={key}>
              {SPECIALIST_TIER_LABELS[key]}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-ink/70">
          ▼
        </span>
      </div>

      <p className="text-center text-sm text-accent underline-offset-4">
        <span className="underline">
          Цена на {service.name.toLowerCase()} от {SPECIALIST_TIER_LABELS[tier]}
        </span>
      </p>

      {rows.length === 0 ? (
        <p className="text-center text-ink-muted">Прайс для этого типа услуг скоро появится.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink/15" data-service-price-table>
          <table className="w-full text-center text-sm">
            <thead>
              <tr className="bg-ink-muted text-white">
                <th className="px-4 py-3 font-medium uppercase tracking-wide">Женская</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wide">Мужская</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${row.name}-${index}`}
                  className={index % 2 === 0 ? "bg-white" : "bg-sand/40"}
                >
                  <td className="px-4 py-3 font-medium tabular-nums text-ink">
                    {formatPriceDisplay(row.prices?.female?.[tier])}
                  </td>
                  <td className="px-4 py-3 font-medium tabular-nums text-ink">
                    {formatPriceDisplay(row.prices?.male?.[tier])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-center text-base leading-relaxed text-ink-muted md:text-lg">
        {description}
      </p>

      <div className="space-y-5">
        <Link
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl bg-ink-muted px-6 py-4 text-center text-lg font-medium uppercase leading-tight tracking-wide text-white transition hover:bg-ink-muted/90 md:text-xl"
        >
          Бесплатная консультация со специалистом
        </Link>

        <p className="px-2 text-center text-base leading-relaxed text-ink-muted md:text-lg">
          Познакомьтесь с мастером заранее, обсудите пожелания и получите профессиональные
          рекомендации перед процедурой.
        </p>
      </div>
      </div>
    </ServiceTypeShell>
  );
}
