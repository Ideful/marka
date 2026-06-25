import Link from "next/link";
import type { MainService, ServiceType } from "@/lib/api/services";
import { serviceDirectionHref } from "@/lib/api/services";

type Props = {
  main: MainService;
  service: ServiceType;
  children: React.ReactNode;
};

export function ServiceTypeShell({ main, service, children }: Props) {
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
          className="flex flex-wrap items-baseline justify-center gap-x-[0.9rem] gap-y-3 text-center font-medium uppercase tracking-wide text-ink"
          aria-label="Типы услуг"
        >
          {main.services.map((item, index) => {
            const active = item.slug === service.slug;
            return (
              <span key={item.slug} className="inline-flex items-baseline">
                {index > 0 ? (
                  <span className="mx-[0.9rem] text-[0.9rem] leading-none text-ink/40">-</span>
                ) : null}
                <Link
                  href={`/services/${main.slug}/${item.slug}`}
                  className={`border-b-2 transition ${
                    active
                      ? "border-ink pb-1 text-[1.8rem] leading-tight text-ink"
                      : "border-transparent pb-0.5 text-[0.9rem] text-ink-muted hover:border-ink/30 hover:text-ink"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.name}
                </Link>
              </span>
            );
          })}
        </nav>
      ) : null}

      {children}
    </section>
  );
}
