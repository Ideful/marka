"use client";

import { useEffect, useState } from "react";

type Section = { id: string; label: string };

type Props = {
  sections: Section[];
};

export function DotNav({ sections }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target?.id) return;
        const idx = sections.findIndex((s) => s.id === visible.target.id);
        if (idx >= 0) setActive((prev) => (prev === idx ? prev : idx));
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  function goTo(index: number) {
    const id = sections[index]?.id;
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Навигация по секциям"
      className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 md:flex lg:right-8"
    >
      {sections.map((s, i) => {
        const isActive = i === active;
        return (
          <button
            key={s.id}
            type="button"
            aria-label={`Перейти: ${s.label}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => goTo(i)}
            className={`rounded-full bg-ink transition-[height,opacity] ${
              isActive ? "h-6 opacity-100" : "h-2 opacity-40 hover:opacity-70"
            } w-2`}
          />
        );
      })}
    </nav>
  );
}
