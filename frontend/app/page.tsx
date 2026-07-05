import { HeroSection } from "@/components/home/HeroSection";
import { YandexRatingBadge } from "@/components/home/YandexRatingBadge";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { ServicesTeaser } from "@/components/home/ServicesTeaser";
import { PortfolioTeaser } from "@/components/home/PortfolioTeaser";
import { GiftCertificateTeaser } from "@/components/home/GiftCertificateTeaser";
import { SpecialistsTeaser } from "@/components/home/SpecialistsTeaser";
import { VacanciesTeaser } from "@/components/home/VacanciesTeaser";
import { ContactsPanel } from "@/components/contacts/ContactsPanel";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MarqueeBar } from "@/components/layout/MarqueeBar";
import { DotNav } from "@/components/home/DotNav";
import { fetchMarqueeText, fetchHomepagePortfolio, fetchGiftCertificate } from "@/lib/api/site-settings";
import { fetchSpecialists } from "@/lib/api/specialists";
import { salonConfig } from "@/lib/domain/salon-config";

const SECTIONS = [
  { id: "hero", label: "Главная" },
  { id: "services", label: "Услуги" },
  { id: "vacancies", label: "Вакансии" },
  { id: "contacts", label: "Контакты" },
];

export default async function HomePage() {
  const [marqueeText, homepagePortfolio, giftCertificate, specialists] = await Promise.all([
    fetchMarqueeText(),
    fetchHomepagePortfolio(),
    fetchGiftCertificate(),
    fetchSpecialists().catch(() => []),
  ]);
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
      <YandexRatingBadge />
      <PhilosophySection />
      <ServicesTeaser />
      <PortfolioTeaser items={homepagePortfolio.items} />
      <GiftCertificateTeaser settings={giftCertificate} />
      <SpecialistsTeaser specialists={specialists} />
      <VacanciesTeaser />
      <ContactsPanel />
      <SiteFooter />
      <MarqueeBar text={marqueeText} />
    </>
  );
}
