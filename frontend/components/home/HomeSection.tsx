import Link from "next/link";
import type { ReactNode } from "react";

export type HomeSectionTone = "light" | "sand" | "dark";

type ToneStyle = {
  section: string;
  eyebrow: string;
  title: string;
  description: string;
  link: string;
};

const toneStyles: Record<HomeSectionTone, ToneStyle> = {
  light: {
    section: "bg-white text-ink",
    eyebrow: "text-ink-muted",
    title: "text-ink",
    description: "text-ink-muted",
    link: "text-ink hover:text-accent",
  },
  sand: {
    section: "bg-sand text-ink",
    eyebrow: "text-ink-muted",
    title: "text-ink",
    description: "text-ink-muted",
    link: "text-ink hover:text-accent",
  },
  dark: {
    section: "bg-ink text-white",
    eyebrow: "text-white/55",
    title: "text-white",
    description: "text-white/70",
    link: "text-white/70 hover:text-white",
  },
};

type HomeSectionProps = {
  id: string;
  headingId: string;
  eyebrow: string;
  title: ReactNode;
  description?: string;
  tone?: HomeSectionTone;
  footerAction?: { href: string; label: string };
  children: ReactNode;
};

export function HomeSection({
  id,
  headingId,
  eyebrow,
  title,
  description,
  tone = "light",
  footerAction,
  children,
}: HomeSectionProps) {
  const styles = toneStyles[tone];

  return (
    <section
      id={id}
      className={`scroll-mt-24 px-4 py-16 md:px-6 md:py-24 ${styles.section}`}
      aria-labelledby={headingId}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:gap-14">
        <header className="mx-auto flex w-full max-w-2xl flex-col items-center gap-2 text-center md:gap-3">
          <p className={`text-xs font-medium uppercase tracking-[0.25em] ${styles.eyebrow}`}>
            {eyebrow}
          </p>
          <h2
            id={headingId}
            className={`text-3xl font-bold uppercase leading-tight tracking-tight md:text-4xl ${styles.title}`}
          >
            {title}
          </h2>
          {description ? (
            <p className={`whitespace-pre-wrap text-base leading-relaxed md:text-lg ${styles.description}`}>
              {description}
            </p>
          ) : null}
        </header>

        {children}

        {footerAction ? (
          <div className="flex justify-center">
            <HomeSectionLink href={footerAction.href} className={styles.link}>
              {footerAction.label}
            </HomeSectionLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}

type LinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function HomeSectionLink({ href, className = "", children }: LinkProps) {
  return (
    <Link
      href={href}
      className={`text-sm font-medium underline-offset-4 hover:underline ${className}`}
    >
      {children}
    </Link>
  );
}

export const homeLightCardClass =
  "group flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition hover:border-accent/40 hover:shadow-md";

export const homeDarkCardClass =
  "group flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-6 py-5 transition hover:border-accent/50 hover:bg-white/10";

export const homeMediaCardClass =
  "overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm";
