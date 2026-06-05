import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactsPanel } from "@/components/contacts/ContactsPanel";
import { ServiceTypeView } from "@/components/services/ServiceTypeView";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  fetchMainService,
  fetchServiceType,
  HAIR_SERVICE_SLUGS,
  subServiceToPriceRow,
} from "@/lib/api/services";

type Props = { params: Promise<{ categorySlug: string; subSlug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return HAIR_SERVICE_SLUGS.map((subSlug) => ({
    categorySlug: "hair",
    subSlug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, subSlug } = await params;
  const main = await fetchMainService(categorySlug);
  const service = await fetchServiceType(categorySlug, subSlug);
  if (!main || !service) return {};
  return {
    title: `${service.name} — ${main.name}`,
    description:
      service.description ||
      `Прайс: ${service.name}. ${main.name}, салон Марка Арена.`,
  };
}

export default async function ServiceSubPage({ params }: Props) {
  const { categorySlug, subSlug } = await params;
  const main = await fetchMainService(categorySlug);
  const service = await fetchServiceType(categorySlug, subSlug);
  if (!main || !service) notFound();

  const rows = (service.sub_services ?? []).map(subServiceToPriceRow);

  return (
    <>
      <article className="px-4 py-12 md:px-6 md:py-16">
        <ServiceTypeView main={main} service={service} rows={rows} />
      </article>
      <ContactsPanel />
      <SiteFooter />
    </>
  );
}
