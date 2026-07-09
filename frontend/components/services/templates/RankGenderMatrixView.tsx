"use client";

import type { MainService, Section } from "@/lib/api/services";
import { formatPriceRub } from "@/lib/format-price";
import {
  STRIZHKA_RANK_ORDER,
  nullablePrice,
  parsePayload,
  rankLabel,
  type RankGenderPayload,
} from "@/lib/table-templates";
import { SectionShell } from "@/components/services/SectionShell";
import { BookingConsultationLink, PriceMatrixTable } from "@/components/services/templates/shared";

type Props = {
  main: MainService;
  section: Section;
};

export function RankGenderMatrixView({ main, section }: Props) {
  const payload = parsePayload<RankGenderPayload>(section.payload, { rows: [] });
  const rows = payload.rows ?? [];

  const tableRows = STRIZHKA_RANK_ORDER.map((rankKey) => {
    const row = rows.find((item) => item.rank === rankKey);
    const female = nullablePrice(row?.prices?.female);
    const male = nullablePrice(row?.prices?.male);
    return [
      rankLabel(rankKey),
      formatPriceRub(female),
      formatPriceRub(male),
    ];
  });

  return (
    <SectionShell main={main} section={section}>
      <div className="space-y-8">
        {tableRows.length === 0 ? (
          <p className="text-center text-ink-muted">Прайс для этого раздела скоро появится.</p>
        ) : (
          <PriceMatrixTable headers={["Должность", "Женская", "Мужская"]} rows={tableRows} />
        )}

        {section.description ? (
          <p className="text-center text-base leading-relaxed text-ink-muted md:text-lg">
            {section.description}
          </p>
        ) : null}

        <BookingConsultationLink />
      </div>
    </SectionShell>
  );
}
