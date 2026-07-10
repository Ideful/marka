"use client";

import type { MainService, Section } from "@/lib/api/services";
import { formatPriceRub } from "@/lib/format-price";
import {
  nullablePrice,
  parsePayload,
  rankLabel,
  type ServiceRankMatrixGroupedPayload,
} from "@/lib/table-templates";
import { SectionShell } from "@/components/services/SectionShell";
import { PriceMatrixTable } from "@/components/services/templates/shared";

type Props = {
  main: MainService;
  section: Section;
};

export function ServiceRankMatrixGroupedView({ main, section }: Props) {
  const payload = parsePayload<ServiceRankMatrixGroupedPayload>(section.payload, { groups: [] });
  const groups = payload.groups ?? [];

  return (
    <SectionShell main={main} section={section}>
      <div className="space-y-10">
        {groups.length === 0 ? (
          <p className="text-center text-ink-muted">Прайс для этого раздела скоро появится.</p>
        ) : (
          groups.map((group) => {
            const headers = ["Услуга", ...group.columns.map((key) => rankLabel(key))];
            const rows = group.rows.map((row) => [
              row.service_name,
              ...group.columns.map((column) =>
                formatPriceRub(nullablePrice(row.prices?.[column])),
              ),
            ]);
            return (
              <div key={group.group_slug} className="space-y-4">
                <h2 className="text-center text-lg font-medium uppercase tracking-wide text-ink">
                  {group.group_title}
                </h2>
                <PriceMatrixTable headers={headers} rows={rows} />
              </div>
            );
          })
        )}
      </div>
    </SectionShell>
  );
}
