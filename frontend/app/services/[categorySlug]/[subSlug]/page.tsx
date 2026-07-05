import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactsPanel } from "@/components/contacts/ContactsPanel";
import { HairOkrashivanieView } from "@/components/services/HairOkrashivanieView";
import { HairUkladkaView } from "@/components/services/HairUkladkaView";
import { SectionView } from "@/components/services/SectionView";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  fetchMainService,
  fetchSection,
  HAIR_SECTION_SLUGS,
  serviceToPriceRow,
} from "@/lib/api/services";

type Props = { params: Promise<{ categorySlug: string; subSlug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return HAIR_SECTION_SLUGS.map((subSlug) => ({
    categorySlug: "hair",
    subSlug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, subSlug } = await params;
  const main = await fetchMainService(categorySlug);
  const section = await fetchSection(categorySlug, subSlug);
  if (!main || !section) return {};
  return {
    title: `${section.name} — ${main.name}`,
    description:
      section.description ||
      `Прайс: ${section.name}. ${main.name}, салон Марка Арена.`,
  };
}

export default async function ServiceSectionPage({ params }: Props) {
  const { categorySlug, subSlug } = await params;
  const main = await fetchMainService(categorySlug);
  const section = await fetchSection(categorySlug, subSlug);
  if (!main || !section) notFound();

  const rows = (section.services ?? []).map(serviceToPriceRow);
  const isHairUkladka = categorySlug === "hair" && subSlug === "ukladka";
  const isHairOkrashivanie = categorySlug === "hair" && subSlug === "okrashivanie";

  return (
    <>
      <article className="px-4 py-12 md:px-6 md:py-16">
        {isHairUkladka ? (
          <HairUkladkaView main={main} section={section} rows={rows} />
        ) : isHairOkrashivanie ? (
          <HairOkrashivanieView main={main} section={section} rows={rows} />
        ) : (
          <SectionView main={main} section={section} rows={rows} />
        )}
      </article>
      <ContactsPanel />
      <SiteFooter />
    </>
  );
}
