import Image from "next/image";
import Link from "next/link";
import { salonConfig } from "@/lib/domain/salon-config";

type ContactLink = {
  href: string;
  icon: string;
  label: string;
  external?: boolean;
};

const iconSize = 40;

export function MessengerLinks() {
  const c = salonConfig;

  const links: ContactLink[] = [
    { href: c.telegramUrl, icon: "/icons/telegram.png", label: "Telegram", external: true },
    { href: c.whatsappUrl, icon: "/icons/whatsapp.png", label: "WhatsApp", external: true },
    { href: `tel:${c.phoneTel}`, icon: "/icons/phone.png", label: "Позвонить" },
    { href: c.instagramUrl, icon: "/icons/instagram.png", label: "Instagram", external: true },
    { href: c.yandexMapExternalUrl, icon: "/icons/yandex.png", label: "Яндекс-карты", external: true },
  ];

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
      aria-label="Связаться с салоном"
    >
      {links.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="inline-flex shrink-0 transition-opacity hover:opacity-65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          aria-label={item.label}
          {...(item.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          <Image
            src={item.icon}
            alt=""
            width={iconSize}
            height={iconSize}
            className="h-10 w-10 object-contain"
            aria-hidden
          />
        </Link>
      ))}
    </nav>
  );
}
