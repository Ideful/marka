"use client";

import { useId, useState } from "react";
import type { MainService, Section } from "@/lib/api/services";
import { formatPriceRub } from "@/lib/format-price";
import {
  specialistToggleKeysForMain,
  SPECIALIST_TOGGLE_LABELS,
  type SpecialistToggleKey,
} from "@/lib/table-templates";
import { SectionShell } from "@/components/services/SectionShell";
import { PriceMatrixTable } from "@/components/services/templates/shared";

type Props = {
  main: MainService;
  section: Section;
};

export function ServiceSinglePriceBySpecialistView({ main, section }: Props) {
  const selectId = useId();
  const toggleKeys = specialistToggleKeysForMain(main.slug);
  const [tier, setTier] = useState<SpecialistToggleKey>(toggleKeys[0]);
  const services = section.services ?? [];

  const tableRows = services.map((service) => [
    service.name,
    formatPriceRub(service.specialist_prices?.[tier] ?? 0),
  ]);

  return (
    <SectionShell main={main} section={section}>
      <div className="space-y-8">
        <div className="relative">
          <label htmlFor={selectId} className="sr-only">
            Уровень специалиста
          </label>
          <select
            id={selectId}
            value={tier}
            onChange={(e) => {
              const value = e.target.value;
              if ((toggleKeys as readonly string[]).includes(value)) {
                setTier(value as SpecialistToggleKey);
              }
            }}
            className="w-full cursor-pointer appearance-none rounded-xl border border-ink/20 bg-white px-4 py-3.5 pr-12 text-center text-sm font-medium uppercase tracking-wide text-ink shadow-sm transition hover:border-ink/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          >
            {toggleKeys.map((key) => (
              <option key={key} value={key}>
                {SPECIALIST_TOGGLE_LABELS[key]}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-ink/70">
            ▼
          </span>
        </div>

        {tableRows.length === 0 ? (
          <p className="text-center text-ink-muted">Прайс для этого раздела скоро появится.</p>
        ) : (
          <PriceMatrixTable headers={["Услуга", "Стоимость"]} rows={tableRows} />
        )}
      </div>
    </SectionShell>
  );
}
