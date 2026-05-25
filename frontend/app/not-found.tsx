import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function NotFound() {
  return (
    <>
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center md:py-32">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-ink-muted">404</p>
        <h1 className="mt-4 text-2xl font-bold text-ink md:text-3xl">Страница не найдена</h1>
        <p className="mt-3 max-w-md text-ink-muted">
          Проверьте адрес или вернитесь на главную.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-ink px-8 py-3 text-sm font-semibold text-white hover:bg-ink/90"
        >
          На главную
        </Link>
      </div>
      <SiteFooter />
    </>
  );
}
