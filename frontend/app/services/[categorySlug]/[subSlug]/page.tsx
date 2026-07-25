import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactsPanel } from "@/components/contacts/ContactsPanel";
import { SectionRenderer } from "@/components/services/SectionRenderer";
import { BookingConsultationLink } from "@/components/services/templates/shared";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  ALL_SECTION_PARAMS,
  fetchMainService,
  fetchSection,
} from "@/lib/api/services";

type Props = { params: Promise<{ categorySlug: string; subSlug: string }> };

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return ALL_SECTION_PARAMS.map(({ categorySlug, subSlug }) => ({
    categorySlug,
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

  return (
    <>
      <article className="px-4 pt-12 pb-8 md:px-6 md:pt-16 md:pb-10">
        <SectionRenderer main={main} section={section} />
      </article>
      <div className="bg-white px-4 md:px-6">
        <div className="mx-auto max-w-xl">
          <BookingConsultationLink />
        </div>
      </div>
      <ContactsPanel flushTop />
      <SiteFooter />
    </>
  );
}
