"use client";

import { useMemo, useState } from "react";
import {
  SPECIALIST_TIER_KEYS,
  SPECIALIST_TIER_LABELS,
  type SpecialistTierKey,
} from "@/data/price-tiers";
import { SpecialistsGrid } from "@/components/specialists/SpecialistsGrid";
import type { Specialist } from "@/lib/api/specialists";

type Props = {
  specialists: Specialist[];
};

const ALL = "";

export function SpecialistsList({ specialists }: Props) {
  const [filter, setFilter] = useState<typeof ALL | SpecialistTierKey>(ALL);

  const filtered = useMemo(() => {
    if (filter === ALL) return specialists;
    return specialists.filter((sp) => sp.class === filter);
  }, [specialists, filter]);

  return (
    <div className="mt-10 space-y-8">
      <div className="max-w-md">
        <label
          htmlFor="specialists-class-filter"
          className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-muted"
        >
          Категория
        </label>
        <select
          id="specialists-class-filter"
          value={filter}
          onChange={(e) => {
            const v = e.target.value;
            if (v === ALL) {
              setFilter(ALL);
              return;
            }
            if ((SPECIALIST_TIER_KEYS as readonly string[]).includes(v)) {
              setFilter(v as SpecialistTierKey);
            }
          }}
          className="w-full cursor-pointer appearance-none rounded-xl border border-ink/15 bg-white px-4 py-3.5 text-sm font-medium text-ink shadow-sm transition hover:border-ink/25 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        >
          <option value={ALL}>Все категории</option>
          {SPECIALIST_TIER_KEYS.map((key) => (
            <option key={key} value={key}>
              {SPECIALIST_TIER_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-ink-muted">В этой категории пока никого нет.</p>
      ) : (
        <SpecialistsGrid specialists={filtered} />
      )}
    </div>
  );
}
