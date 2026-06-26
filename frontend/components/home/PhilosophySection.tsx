import { salonConfig } from "@/lib/domain/salon-config";

export function PhilosophySection() {
  const { philosophy } = salonConfig;

  return (
    <section
      id="philosophy"
      className="scroll-mt-24 bg-white px-4 py-16 md:px-6 md:py-24"
      aria-labelledby="philosophy-heading"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-2 md:gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
            {philosophy.label}
          </p>
          <h2
            id="philosophy-heading"
            className="text-3xl font-bold uppercase leading-tight tracking-tight text-ink md:text-4xl"
          >
            {philosophy.title}
          </h2>
        </div>

        <div className="flex flex-col gap-4 text-base leading-relaxed text-ink-muted md:text-lg">
          {philosophy.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
