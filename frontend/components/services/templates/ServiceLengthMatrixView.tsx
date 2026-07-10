"use client";

import {
  HAIR_LENGTH_KEYS,
  HAIR_LENGTH_LABELS,
} from "@/data/hair-lengths";
import type { MainService, Section } from "@/lib/api/services";
import { formatPriceRub } from "@/lib/format-price";
import {
  nullablePrice,
  parsePayload,
  type ServiceLengthPayload,
} from "@/lib/table-templates";
import { SectionShell } from "@/components/services/SectionShell";
import { PriceMatrixTable } from "@/components/services/templates/shared";

type Props = {
  main: MainService;
  section: Section;
};

export function ServiceLengthMatrixView({ main, section }: Props) {
  const payload = parsePayload<ServiceLengthPayload>(section.payload, { rows: [] });
  const rows = payload.rows ?? [];

  const headers = ["Услуга", ...HAIR_LENGTH_KEYS.map((key) => HAIR_LENGTH_LABELS[key])];
  const tableRows = rows.map((row) => [
    row.service_name,
    ...HAIR_LENGTH_KEYS.map((key) => formatPriceRub(nullablePrice(row.prices?.[key]))),
  ]);

  return (
    <SectionShell main={main} section={section}>
      {tableRows.length === 0 ? (
        <p className="text-center text-ink-muted">Прайс для окрашивания скоро появится.</p>
      ) : (
        <PriceMatrixTable headers={headers} rows={tableRows} layout="service-length" />
      )}
    </SectionShell>
  );
}
