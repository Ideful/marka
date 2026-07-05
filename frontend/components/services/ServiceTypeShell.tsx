import Link from "next/link";
import type { MainService, ServiceType } from "@/lib/api/services";
import { serviceDirectionHref } from "@/lib/api/services";

type Props = {
  main: MainService;
  service: ServiceType;
  children: React.ReactNode;
};

const FIRST_ROW_COUNT = 2;

function ServiceTypeLink({
  item,
  active,
  mainSlug,
}: {
  item: ServiceType;
  active: boolean;
  mainSlug: string;
}) {
  return (
    <Link
      href={`/services/${mainSlug}/${item.slug}`}
      className={
        active
          ? "text-lg font-bold italic text-ink underline decoration-2 underline-offset-[5px] sm:text-xl"
          : "text-base font-normal text-ink-muted transition hover:text-ink sm:text-lg"
      }
      aria-current={active ? "page" : undefined}
    >
      {item.name}
    </Link>
  );
}

function ServiceTypeRow({
  items,
  mainSlug,
  activeSlug,
}: {
  items: ServiceType[];
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
          <ServiceTypeLink
            item={item}
            active={item.slug === activeSlug}
            mainSlug={mainSlug}
          />
        </span>
      ))}
    </div>
  );
}

export function ServiceTypeShell({ main, service, children }: Props) {
  const firstRow = main.services.slice(0, FIRST_ROW_COUNT);
  const secondRow = main.services.slice(FIRST_ROW_COUNT);

  return (
    <section className="mx-auto max-w-lg space-y-8">
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

      {main.services.length > 0 ? (
        <nav
          className="mx-auto flex max-w-xl flex-col gap-2 text-center uppercase tracking-wide"
          aria-label="Типы услуг"
        >
          <ServiceTypeRow items={firstRow} mainSlug={main.slug} activeSlug={service.slug} />
          <ServiceTypeRow items={secondRow} mainSlug={main.slug} activeSlug={service.slug} />
        </nav>
      ) : null}

      {children}
    </section>
  );
}
