"use client";

import Link from "next/link";
import {
  HAIR_LENGTH_KEYS,
  HAIR_LENGTH_LABELS,
  lengthPricesHasValue,
  type LengthPrices,
} from "@/data/hair-lengths";
import type { MainService, Section, ServicePriceRow } from "@/lib/api/services";
import { SectionShell } from "@/components/services/SectionShell";

const BOOKING_URL = "https://n717666.yclients.com/company/677152/personal/menu?o=";

type Props = {
  main: MainService;
  section: Section;
  rows: ServicePriceRow[];
};

function formatAmount(value: number): string {
  if (value <= 0) return "—";
  return new Intl.NumberFormat("ru-RU").format(value);
}

function LengthPriceTable({ prices }: { prices: LengthPrices }) {
  if (!lengthPricesHasValue(prices)) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-ink/15" data-service-price-table>
      <table className="w-full text-center text-sm">
        <thead>
          <tr className="bg-ink-muted text-white">
            {HAIR_LENGTH_KEYS.map((key) => (
              <th key={key} className="px-3 py-3 font-medium uppercase tracking-wide">
                {HAIR_LENGTH_LABELS[key]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white">
            {HAIR_LENGTH_KEYS.map((key) => (
              <td key={key} className="px-3 py-3 font-medium tabular-nums text-ink">
                {formatAmount(prices[key])}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function OkrashivanieBlock({ row }: { row: ServicePriceRow }) {
  const description = row.description?.trim();

  return (
    <article className="space-y-5">
      <h2 className="text-center text-base font-medium text-ink underline underline-offset-4">
        {row.name}
      </h2>

      {row.length_prices ? <LengthPriceTable prices={row.length_prices} /> : null}

      {description ? (
        <p className="text-center text-sm leading-relaxed text-ink-muted md:text-base">
          {description}
        </p>
      ) : null}

      <div className="border-y border-ink/10 py-3">
        <p className="text-center text-sm text-ink-muted">
          <span className="inline-flex items-center gap-2">
            <span>наши работы</span>
            <span aria-hidden className="text-base">
              🖼
            </span>
          </span>
        </p>
      </div>
    </article>
  );
}

export function HairOkrashivanieView({ main, section, rows }: Props) {
  return (
    <SectionShell main={main} section={section}>
      <div className="space-y-8">
        {rows.length === 0 ? (
          <p className="text-center text-ink-muted">Прайс для окрашивания скоро появится.</p>
        ) : (
          <div className="space-y-10">
            {rows.map((row, index) => (
              <OkrashivanieBlock key={row.id ?? `${row.name}-${index}`} row={row} />
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
    </SectionShell>
  );
}
