"use client";

import Link from "next/link";
import {
  SPECIALIST_TIER_LABELS,
  type SpecialistTierKey,
} from "@/data/price-tiers";
import type { MainService, ServicePriceRow, ServiceType } from "@/lib/api/services";
import { formatPriceRub } from "@/lib/format-price";
import { ServiceTypeShell } from "@/components/services/ServiceTypeShell";

const BOOKING_URL = "https://n717666.yclients.com/company/677152/personal/menu?o=";

/** Порядок уровней в списке цен (от старшего к младшему). */
const TIER_DISPLAY_ORDER: SpecialistTierKey[] = [
  "art_director",
  "top_stylist",
  "stylist",
  "top_master",
  "master",
];

type Props = {
  main: MainService;
  service: ServiceType;
  rows: ServicePriceRow[];
};

function formatAmount(value: number): string {
  if (value <= 0) return "—";
  return new Intl.NumberFormat("ru-RU").format(value);
}

function isCompactPriceRow(name: string): boolean {
  return /вечерн/i.test(name);
}

function tierPricesForRow(row: ServicePriceRow): { tier: SpecialistTierKey; price: number }[] {
  const female = row.prices?.female;
  if (!female) return [];
  return TIER_DISPLAY_ORDER.map((tier) => ({
    tier,
    price: female[tier] ?? 0,
  })).filter((item) => item.price > 0);
}

function PriceList({ row }: { row: ServicePriceRow }) {
  const items = tierPricesForRow(row);

  if (isCompactPriceRow(row.name)) {
    return (
      <div className="space-y-2 py-2 text-center text-sm" data-service-price-table>
        {items.map(({ tier, price }) => (
          <p key={tier} className="text-ink underline underline-offset-4">
            {SPECIALIST_TIER_LABELS[tier]} {formatPriceRub(price)}
          </p>
        ))}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-ink/10 border-y border-ink/10" data-service-price-table>
      {TIER_DISPLAY_ORDER.map((tier) => {
        const price = row.prices?.female?.[tier] ?? 0;
        if (price <= 0) return null;
        return (
          <li
            key={tier}
            className="flex items-center justify-between px-2 py-2.5 text-sm text-ink"
          >
            <span>{SPECIALIST_TIER_LABELS[tier]}</span>
            <span className="font-medium tabular-nums">{formatAmount(price)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function UkladkaCard({ row }: { row: ServicePriceRow }) {
  const description =
    row.description?.trim() ||
    "В стоимость услуги входит: мытьё головы шампунем и кондиционером, сушка феном, укладка щёткой с использованием профессиональных средств.";

  return (
    <article className="space-y-5">
      <div className="rounded-xl bg-ink-muted px-4 py-3 text-center text-sm font-medium uppercase tracking-wide text-white">
        {row.name}
      </div>

      <PriceList row={row} />

      <p className="text-center text-base leading-relaxed text-ink-muted">{description}</p>

      <p className="text-center text-sm text-ink-muted">
        <span className="inline-flex items-center gap-2">
          <span>наши работы</span>
          <span aria-hidden className="text-base">
            🖼
          </span>
        </span>
      </p>
    </article>
  );
}

export function HairUkladkaView({ main, service, rows }: Props) {
  return (
    <ServiceTypeShell main={main} service={service}>
      <div className="space-y-8">
      {rows.length === 0 ? (
        <p className="text-center text-ink-muted">Прайс для укладок скоро появится.</p>
      ) : (
        <div className="space-y-10">
          {rows.map((row, index) => (
            <UkladkaCard key={row.id ?? `${row.name}-${index}`} row={row} />
          ))}
        </div>
      )}

      <Link
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl bg-ink-muted px-6 py-4 text-center text-lg font-medium uppercase leading-tight tracking-wide text-white transition hover:bg-ink-muted/90 md:text-xl"
      >
        Бесплатная консультация со специалистом
      </Link>
      </div>
    </ServiceTypeShell>
  );
}
