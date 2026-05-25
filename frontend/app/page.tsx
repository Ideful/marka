import { HeroSection } from "@/components/home/HeroSection";
import { ServicesTeaser } from "@/components/home/ServicesTeaser";
import { VacanciesTeaser } from "@/components/home/VacanciesTeaser";
import { ContactsPanel } from "@/components/contacts/ContactsPanel";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DotNav } from "@/components/home/DotNav";
import { salonConfig } from "@/lib/domain/salon-config";

const SECTIONS = [
  { id: "hero", label: "Главная" },
  { id: "services", label: "Услуги" },
  { id: "vacancies", label: "Вакансии" },
  { id: "contacts", label: "Контакты" },
];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${salonConfig.siteUrl()}/#salon`,
    name: salonConfig.brandName,
    description: salonConfig.tagline,
    url: salonConfig.siteUrl(),
    telephone: salonConfig.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      streetAddress: "улица Парковая, 2",
      addressLocality: "Балашиха",
      addressRegion: "Московская область",
      addressCountry: "RU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: salonConfig.geo.lat,
      longitude: salonConfig.geo.lng,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "10:00",
      closes: "21:00",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DotNav sections={SECTIONS} />
      <HeroSection />
      <ServicesTeaser />
      <VacanciesTeaser />
      <ContactsPanel />
      <SiteFooter />
    </>
  );
}
