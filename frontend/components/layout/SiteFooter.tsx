import Link from "next/link";
import { salonConfig } from "@/lib/domain/salon-config";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-ink/10 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center md:flex-row md:text-left md:px-6">
        <p className="text-xs text-ink-muted">
          © {salonConfig.brandName.toLowerCase()} {year}
        </p>
        <Link
          href="/privacy-policy"
          className="text-xs text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Политика конфиденциальности
        </Link>
      </div>
    </footer>
  );
}
