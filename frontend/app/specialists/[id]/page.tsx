import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SpecialistPortfolio } from "@/components/specialists/SpecialistPortfolio";
import { SpecialistSections } from "@/components/specialists/SpecialistSections";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getApiBaseUrl, resolvePhotoUrl } from "@/lib/api/config";
import { SPECIALIST_TIER_LABELS } from "@/data/price-tiers";
import { fetchSpecialist } from "@/lib/api/specialists";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sp = await fetchSpecialist(Number(id));
  if (!sp) return { title: "Специалист" };
  return {
    title: sp.name,
    description: sp.description[0]?.description?.slice(0, 160),
  };
}

export default async function SpecialistDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();

  const specialist = await fetchSpecialist(numId);
  if (!specialist) notFound();

  const apiBase = getApiBaseUrl();
  const photoSrc = resolvePhotoUrl(specialist.photo_url, apiBase);

  return (
    <>
      <article className="mx-auto max-w-lg px-4 py-12 md:px-6 md:py-16">
        <Link
          href="/specialists"
          className="text-sm font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          ← Все специалисты
        </Link>

        <header className="mt-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {SPECIALIST_TIER_LABELS[specialist.class]}
          </p>
          <h1 className="mt-2 text-2xl font-bold uppercase tracking-wide text-ink md:text-3xl">
            {specialist.name}
          </h1>
        </header>

        <div className="mx-auto mt-8 max-w-sm overflow-hidden rounded-sm border-2 border-accent/80 bg-white p-1 shadow-sm">
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoSrc}
              alt={specialist.name}
              className="aspect-[3/4] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center bg-sand text-ink-muted">
              Фото скоро
            </div>
          )}
        </div>

        <div className="mt-10" data-booking-trigger>
          <SpecialistSections sections={specialist.description} />
          <SpecialistPortfolio items={specialist.portfolio} />
        </div>
      </article>
      <SiteFooter />
    </>
  );
}
