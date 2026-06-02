import { salonConfig } from "@/lib/domain/salon-config";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function HeroSection() {
  const c = salonConfig;
  return (
    <section
      id="hero"
      className="relative flex min-h-[100dvh] scroll-mt-20 flex-col justify-center overflow-hidden bg-ink"
      aria-labelledby="hero-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#2a1810] via-[#1a1412] to-[#0d0c0c]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(255,200,160,0.25), transparent 55%), radial-gradient(circle at 80% 70%, rgba(200,160,120,0.12), transparent 50%)",
        }}
      />

      <video
        className="absolute inset-0 h-full w-full object-cover opacity-50"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/video.MP4" type="video/mp4" />
      </video>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-6 py-28 text-center md:gap-10 md:py-32">
        <p
          id="hero-title"
          className="text-4xl font-semibold uppercase tracking-[0.35em] text-white md:text-6xl"
        >
          Марка
        </p>
        <p className="max-w-md text-sm font-medium uppercase tracking-[0.28em] text-white/80 md:text-base">
          {c.tagline}
        </p>
        <ButtonLink href={c.bookingUrl} variant="glass" size="lg">
          Записаться
        </ButtonLink>
      </div>
    </section>
  );
}
