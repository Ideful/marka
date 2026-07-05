import { HomeSection } from "@/components/home/HomeSection";
import { HOME_PAGE_SECTION_TONES } from "@/components/home/home-section-styles";
import { salonConfig } from "@/lib/domain/salon-config";

export function PhilosophySection() {
  const { philosophy } = salonConfig;

  return (
    <HomeSection
      id="philosophy"
      headingId="philosophy-heading"
      eyebrow={philosophy.label}
      title={philosophy.title}
      tone={HOME_PAGE_SECTION_TONES.philosophy}
      narrow
      flushTop
    >
      <div className="flex flex-col gap-4 text-base leading-relaxed text-ink-muted md:text-lg">
        {philosophy.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </HomeSection>
  );
}
