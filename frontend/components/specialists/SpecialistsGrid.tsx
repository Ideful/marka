import Link from "next/link";
import { getApiBaseUrl, resolvePhotoUrl } from "@/lib/api/config";
import type { Specialist } from "@/lib/api/specialists";

type Props = {
  specialists: Specialist[];
};

export function SpecialistsGrid({ specialists }: Props) {
  const apiBase = getApiBaseUrl();

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {specialists.map((sp) => {
        const photoSrc = resolvePhotoUrl(sp.photo_url, apiBase);
        const previewTitle = sp.description.find((s) => s.title?.trim())?.title;

        return (
          <li key={sp.id}>
            <Link
              href={`/specialists/${sp.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition hover:border-accent/40 hover:shadow-md"
            >
              <div className="aspect-[4/5] w-full bg-sand">
                {photoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoSrc}
                    alt={sp.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-ink-muted">
                    Фото скоро
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-5">
                <h2 className="text-lg font-semibold uppercase tracking-wide text-ink group-hover:text-accent">
                  {sp.name}
                </h2>
                {previewTitle ? (
                  <p className="text-sm text-ink-muted">{previewTitle}</p>
                ) : null}
                <span className="mt-3 text-sm font-medium text-ink-muted group-hover:text-ink">
                  Подробнее →
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
