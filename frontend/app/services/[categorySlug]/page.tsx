import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { fetchMainService, firstServiceSlug, MAIN_SERVICE_SLUGS } from "@/lib/api/services";

type Props = { params: Promise<{ categorySlug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return MAIN_SERVICE_SLUGS.map((categorySlug) => ({ categorySlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const cat = await fetchMainService(categorySlug);
  if (!cat) return {};
  return {
    title: cat.name,
    description: `Услуги: ${cat.name}. Салон Марка Арена, Балашиха.`,
  };
}

/** /services/hair → /services/hair/strizhka (первый тип услуги в направлении). */
export default async function ServiceCategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const cat = await fetchMainService(categorySlug);
  if (!cat) notFound();

  const first = firstServiceSlug(cat);
  if (!first) notFound();

  redirect(`/services/${categorySlug}/${first}`);
}
