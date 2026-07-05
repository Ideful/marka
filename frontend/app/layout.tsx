import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CookieBanner } from "@/components/CookieBanner";
import { salonConfig } from "@/lib/domain/salon-config";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f3ee",
};

export const metadata: Metadata = {
  metadataBase: new URL(salonConfig.siteUrl()),
  title: {
    default: `${salonConfig.brandName} — ${salonConfig.tagline}`,
    template: `%s — ${salonConfig.brandName}`,
  },
  description:
    "Парикмахерские услуги, ногтевой сервис, брови и ресницы, косметология, макияж. Балашиха, ул. Парковая, 2.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: salonConfig.brandName,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={montserrat.variable}>
      <body className="font-sans">
        <SiteHeader />
        <main>{children}</main>
        <CookieBanner />
      </body>
    </html>
  );
}
