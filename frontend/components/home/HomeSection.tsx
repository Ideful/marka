import Link from "next/link";
import type { ReactNode } from "react";
import {
  homeSectionShellClass,
  homeSectionShellFlushTopClass,
  homeSectionToneStyles,
  type HomeSectionTone,
} from "@/components/home/home-section-styles";

export type { HomeSectionTone };

type HomeSectionProps = {
  id: string;
  headingId: string;
  eyebrow: string;
  title: ReactNode;
  description?: string;
  tone?: HomeSectionTone;
  footerAction?: { href: string; label: string };
  /** Узкий контент (философия, сертификат, специалисты). */
  narrow?: boolean;
  /** Уменьшенный верхний отступ (секция того же фона, что и предыдущий блок). */
  flushTop?: boolean;
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
  narrow = false,
  flushTop = false,
  children,
}: HomeSectionProps) {
  const styles = homeSectionToneStyles[tone];
  const shell = flushTop ? homeSectionShellFlushTopClass : homeSectionShellClass;

  return (
    <section
      id={id}
      className={`${shell} ${styles.section}`}
      aria-labelledby={headingId}
    >
      <div
        className={`mx-auto flex flex-col gap-10 md:gap-14 ${
          narrow ? "max-w-3xl" : "max-w-6xl"
        }`}
      >
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

export {
  homeDarkCardClass,
  homeLightCardClass,
  homeLightRowCardClass,
  homeMediaCardClass,
} from "@/components/home/home-section-styles";
