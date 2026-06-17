import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactsPanel } from "@/components/contacts/ContactsPanel";
import { HairOkrashivanieView } from "@/components/services/HairOkrashivanieView";
import { HairUkladkaView } from "@/components/services/HairUkladkaView";
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
  const isHairUkladka = categorySlug === "hair" && subSlug === "ukladka";
  const isHairOkrashivanie = categorySlug === "hair" && subSlug === "okrashivanie";

  return (
    <>
      <article className="px-4 py-12 md:px-6 md:py-16">
        {isHairUkladka ? (
          <HairUkladkaView main={main} service={service} rows={rows} />
        ) : isHairOkrashivanie ? (
          <HairOkrashivanieView main={main} service={service} rows={rows} />
        ) : (
          <ServiceTypeView main={main} service={service} rows={rows} />
        )}
      </article>
      <ContactsPanel />
      <SiteFooter />
    </>
  );
}
