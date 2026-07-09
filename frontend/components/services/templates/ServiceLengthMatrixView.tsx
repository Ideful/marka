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
import { BookingConsultationLink } from "@/components/services/templates/shared";

type Props = {
  main: MainService;
  section: Section;
};

export function ServiceLengthMatrixView({ main, section }: Props) {
  const payload = parsePayload<ServiceLengthPayload>(section.payload, { rows: [] });
  const rows = payload.rows ?? [];

  return (
    <SectionShell main={main} section={section}>
      <div className="space-y-8">
        {rows.length === 0 ? (
          <p className="text-center text-ink-muted">Прайс для окрашивания скоро появится.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-ink/15" data-service-price-table>
            <table className="w-full text-center text-sm">
              <thead>
                <tr className="bg-ink-muted text-white">
                  <th className="px-3 py-3 text-left font-medium uppercase tracking-wide">Услуга</th>
                  {HAIR_LENGTH_KEYS.map((key) => (
                    <th key={key} className="px-3 py-3 font-medium uppercase tracking-wide">
                      {HAIR_LENGTH_LABELS[key]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.service_slug}
                    className={index % 2 === 0 ? "bg-white" : "bg-sand/40"}
                  >
                    <td className="px-3 py-3 text-left font-medium text-ink">{row.service_name}</td>
                    {HAIR_LENGTH_KEYS.map((key) => (
                      <td key={key} className="px-3 py-3 font-medium tabular-nums text-ink">
                        {formatPriceRub(nullablePrice(row.prices?.[key]))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <BookingConsultationLink />
      </div>
    </SectionShell>
  );
}
