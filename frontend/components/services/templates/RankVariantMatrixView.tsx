"use client";

import type { MainService, Section } from "@/lib/api/services";
import { formatPriceRub } from "@/lib/format-price";
import {
  UKLADKA_RANK_ORDER,
  VARIANT_LABELS,
  nullablePrice,
  parsePayload,
  rankLabel,
  type RankVariantPayload,
} from "@/lib/table-templates";
import { SectionShell } from "@/components/services/SectionShell";
import { BookingConsultationLink, PriceMatrixTable } from "@/components/services/templates/shared";

type Props = {
  main: MainService;
  section: Section;
};

export function RankVariantMatrixView({ main, section }: Props) {
  const payload = parsePayload<RankVariantPayload>(section.payload, { variants: [], rows: [] });
  const variants = payload.variants?.length
    ? payload.variants
    : ["day", "evening"];
  const rows = payload.rows ?? [];

  const headers = ["Должность", ...variants.map((key) => VARIANT_LABELS[key] ?? key)];
  const tableRows = UKLADKA_RANK_ORDER.map((rankKey) => {
    const row = rows.find((item) => item.rank === rankKey);
    return [
      rankLabel(rankKey),
      ...variants.map((variant) => formatPriceRub(nullablePrice(row?.prices?.[variant]))),
    ];
  });

  return (
    <SectionShell main={main} section={section}>
      <div className="space-y-8">
        {tableRows.length === 0 ? (
          <p className="text-center text-ink-muted">Прайс для укладок скоро появится.</p>
        ) : (
          <PriceMatrixTable headers={headers} rows={tableRows} />
        )}

        <BookingConsultationLink />
      </div>
    </SectionShell>
  );
}
