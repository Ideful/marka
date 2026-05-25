import type { Metadata } from "next";
import { ContactsPanel } from "@/components/contacts/ContactsPanel";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Адрес, режим работы, карта и мессенджеры салона Марка Арена в Балашихе.",
};

export default function ContactsPage() {
  return (
    <>
      <ContactsPanel showEyebrow />
      <SiteFooter />
    </>
  );
}
