"use client";

import type { MainService, Section } from "@/lib/api/services";
import { formatPriceRub } from "@/lib/format-price";
import {
  nullablePrice,
  parsePayload,
  type ServiceSingleRankPayload,
} from "@/lib/table-templates";
import { SectionShell } from "@/components/services/SectionShell";
import { PriceMatrixTable } from "@/components/services/templates/shared";

type Props = {
  main: MainService;
  section: Section;
};

export function ServiceSingleRankMatrixView({ main, section }: Props) {
  const payload = parsePayload<ServiceSingleRankPayload>(section.payload, {
    columns: [],
    rows: [],
  });
  const columns = payload.columns ?? [];
  const rows = payload.rows ?? [];

  const headers = ["Услуга", ...columns.map((column) => column.label)];
  const tableRows = rows.map((row) => [
    row.service_name,
    ...columns.map((column) => formatPriceRub(nullablePrice(row.prices?.[column.key]))),
  ]);

  return (
    <SectionShell main={main} section={section}>
      {tableRows.length === 0 ? (
        <p className="text-center text-ink-muted">Прайс для этого раздела скоро появится.</p>
      ) : (
        <PriceMatrixTable headers={headers} rows={tableRows} />
      )}
    </SectionShell>
  );
}
