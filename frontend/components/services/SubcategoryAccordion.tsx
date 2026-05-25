"use client";

import { useCallback, useState } from "react";
import type { ServiceSubcategory } from "@/data/service-tree";
import { PriceTable } from "@/components/services/PriceTable";

type Props = {
  categorySlug: string;
  subs: ServiceSubcategory[];
};

export function SubcategoryAccordion({ categorySlug, subs }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = useCallback((slug: string) => {
    setOpen((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }, []);

  return (
    <ul className="mt-12 flex flex-col gap-3">
      {subs.map((sub) => {
        const isOpen = Boolean(open[sub.slug]);
        const panelId = `panel-${categorySlug}-${sub.slug}`;
        const headingId = `heading-${categorySlug}-${sub.slug}`;

        return (
          <li
            key={sub.slug}
            className="overflow-hidden rounded-xl border border-ink/10 bg-white transition hover:border-ink/15"
          >
            <button
              type="button"
              id={headingId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(sub.slug)}
              className="flex min-h-[52px] w-full touch-manipulation items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium text-ink transition hover:bg-sand active:bg-sand"
            >
              <span>{sub.title}</span>
              <span
                className="shrink-0 text-ink-muted transition-transform"
                aria-hidden
                style={{ transform: isOpen ? "rotate(180deg)" : undefined }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            {isOpen ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headingId}
                className="border-t border-ink/5 bg-sand/40 px-5 pb-5 pt-4"
              >
                {sub.description ? (
                  <p className="mb-4 text-sm leading-relaxed text-ink-muted">{sub.description}</p>
                ) : null}
                <PriceTable rows={sub.rows} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
