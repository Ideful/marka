import type { Metadata } from "next";
import { ContactsPanel } from "@/components/contacts/ContactsPanel";
import { SpecialistsList } from "@/components/specialists/SpecialistsList";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { fetchSpecialists } from "@/lib/api/specialists";

export const metadata: Metadata = {
  title: "Специалисты",
  description: "Команда салона МАРКА АРЕНА в Балашихе.",
};

/** Данные из API при каждом запросе (без ISR-кэша на 60 с). */
export const dynamic = "force-dynamic";

export default async function SpecialistsPage() {
  let specialists: Awaited<ReturnType<typeof fetchSpecialists>> = [];
  let loadError: string | null = null;

  try {
    specialists = await fetchSpecialists();
  } catch {
    loadError =
      "Не удалось загрузить список специалистов. Проверьте, что запущен backend (make dev-backend).";
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">
          Команда
        </p>
        <h1 className="mt-3 text-3xl font-bold uppercase tracking-tight text-ink md:text-4xl">
          Специалисты
        </h1>

        {loadError ? (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {loadError}
          </p>
        ) : specialists.length === 0 ? (
          <p className="mt-6 max-w-2xl text-ink-muted">
            Скоро здесь появятся карточки мастеров.
          </p>
        ) : (
          <SpecialistsList specialists={specialists} />
        )}
      </div>
      <ContactsPanel />
      <SiteFooter />
    </>
  );
}
