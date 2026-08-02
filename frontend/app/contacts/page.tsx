import type { Metadata } from "next";
import { ContactsPanel } from "@/components/contacts/ContactsPanel";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { resolvePageSeo } from "@/lib/api/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageSeo("/contacts", {
    title: "Контакты",
    description: "Адрес, режим работы, карта и мессенджеры салона Марка Арена в Балашихе.",
  });
}

export default function ContactsPage() {
  return (
    <>
      <ContactsPanel showEyebrow />
      <SiteFooter />
    </>
  );
}
