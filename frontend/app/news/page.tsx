import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { resolvePageSeo } from "@/lib/api/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageSeo("/news", {
    title: "Новости",
    description: "Новости и акции салона МАРКА АРЕНА в Балашихе.",
  });
}

export default function NewsPage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">Блог</p>
        <h1 className="mt-3 text-3xl font-bold uppercase tracking-tight text-ink md:text-4xl">
          Новости
        </h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Раздел в разработке: здесь будут публикации об акциях, обновлениях и жизни салона.
        </p>
      </div>
      <SiteFooter />
    </>
  );
}
