import Link from "next/link";

export function GiftCertificateTeaser() {
  return (
    <section
      id="certificates"
      className="scroll-mt-24 bg-sand px-4 py-16 md:px-6 md:py-24"
      aria-labelledby="certificates-heading"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:gap-14">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div
            className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-white text-center shadow-sm"
            aria-hidden
          >
            <span className="text-3xl text-ink/20">◇</span>
            <span className="px-6 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
              Фото сертификата скоро
            </span>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 md:gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
                Подарки
              </p>
              <h2
                id="certificates-heading"
                className="text-3xl font-bold uppercase leading-tight tracking-tight text-ink md:text-4xl"
              >
                Подарочный
                <br />
                сертификат
              </h2>
            </div>

            <p className="text-base leading-relaxed text-ink-muted md:text-lg">
              Подарите близким заботу о себе — визит в салон, уход за волосами или выбранную
              услугу. Условия покупки и номиналы добавим в ближайшее время.
            </p>

            <Link
              href="/certificates"
              className="inline-flex w-fit text-sm font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
            >
              Подробнее о сертификатах →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
