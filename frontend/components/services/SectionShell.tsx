import Link from "next/link";
import type { MainService, Section } from "@/lib/api/services";
import { serviceDirectionHref } from "@/lib/api/services";
import { SectionDescription } from "@/components/services/SectionDescription";
import { SectionPortfolio } from "@/components/services/SectionPortfolio";

type Props = {
  main: MainService;
  section: Section;
  children: React.ReactNode;
};

const FIRST_ROW_COUNT = 2;

function sectionNavRows(main: MainService): Section[][] {
  const sections = main.services;
  if (main.slug === "brows-lashes") {
    return sections.map((item) => [item]);
  }
  return [sections.slice(0, FIRST_ROW_COUNT), sections.slice(FIRST_ROW_COUNT)].filter(
    (row) => row.length > 0,
  );
}

function SectionLink({
  item,
  active,
  mainSlug,
}: {
  item: Section;
  active: boolean;
  mainSlug: string;
}) {
  return (
    <Link
      href={`/services/${mainSlug}/${item.slug}`}
      className={
        active
          ? "text-lg font-bold text-ink underline decoration-2 underline-offset-[5px] sm:text-xl"
          : "text-base font-normal text-ink-muted transition hover:text-ink sm:text-lg"
      }
      aria-current={active ? "page" : undefined}
    >
      {item.name}
    </Link>
  );
}

function SectionRow({
  items,
  mainSlug,
  activeSlug,
}: {
  items: Section[];
  mainSlug: string;
  activeSlug: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="leading-normal">
      {items.map((item, index) => (
        <span key={item.slug} className="inline">
          {index > 0 ? (
            <span className="px-1 text-ink/40" aria-hidden>
              -
            </span>
          ) : null}
          <SectionLink item={item} active={item.slug === activeSlug} mainSlug={mainSlug} />
        </span>
      ))}
    </div>
  );
}

export function SectionShell({ main, section, children }: Props) {
  const navRows = sectionNavRows(main);

  return (
    <section className="mx-auto max-w-2xl space-y-8 px-1 sm:px-0">
      <nav className="text-center text-xs text-ink-muted" aria-label="Хлебные крошки">
        <Link href="/" className="hover:text-ink hover:underline">
          Главная
        </Link>
        <span className="mx-1.5">-</span>
        <Link href="/services" className="hover:text-ink hover:underline">
          Услуги
        </Link>
        <span className="mx-1.5">-</span>
        <Link href={serviceDirectionHref(main)} className="hover:text-ink hover:underline">
          {main.name}
        </Link>
      </nav>

      <h1 className="text-center text-2xl font-bold uppercase tracking-wide text-ink md:text-3xl">
        {main.name}
      </h1>

      {navRows.length > 0 ? (
        <nav
          className="mx-auto flex max-w-xl flex-col gap-2 text-center uppercase tracking-wide"
          aria-label="Разделы"
        >
          {navRows.map((row) => (
            <SectionRow
              key={row.map((item) => item.slug).join("-")}
              items={row}
              mainSlug={main.slug}
              activeSlug={section.slug}
            />
          ))}
        </nav>
      ) : null}

      {children}

      <SectionDescription text={section.description} />

      <SectionPortfolio items={section.portfolio ?? []} />
    </section>
  );
}
