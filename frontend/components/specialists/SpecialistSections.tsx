import type { DescriptionSection } from "@/lib/api/specialists";

type Props = {
  sections: DescriptionSection[];
  className?: string;
};

export function SpecialistSections({ sections, className = "" }: Props) {
  if (!sections?.length) return null;

  return (
    <div className={`flex flex-col gap-6 ${className}`.trim()}>
      {sections.map((block, index) => {
        const title = block.title?.trim();
        const body = block.description?.trim();
        if (!title && !body) return null;

        return (
          <section key={`${title}-${index}`} className="flex flex-col gap-2">
            {title ? (
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink md:text-base">
                {title}
              </h3>
            ) : null}
            {body ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink-muted md:text-base">
                {body}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
