const PLACEHOLDER_COUNT = 6;

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink/15 bg-sand/50 text-center"
      aria-hidden
    >
      <span className="text-2xl text-ink/20">◇</span>
      <span className="px-4 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
        {label}
      </span>
    </div>
  );
}

export function PortfolioTeaser() {
  return (
    <section
      id="portfolio"
      className="scroll-mt-24 bg-white px-4 py-16 md:px-6 md:py-24"
      aria-labelledby="portfolio-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:gap-14">
        <div className="flex flex-col gap-2 md:gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
            Работы
          </p>
          <h2
            id="portfolio-heading"
            className="max-w-xl text-3xl font-bold uppercase leading-tight tracking-tight text-ink md:text-4xl"
          >
            Портфолио
          </h2>
          <p className="max-w-2xl text-ink-muted">
            Скоро здесь появятся фотографии наших работ — стрижки, окрашивания и укладки.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
          {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
            <PhotoPlaceholder key={index} label="Фото скоро" />
          ))}
        </div>
      </div>
    </section>
  );
}
