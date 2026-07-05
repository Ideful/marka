import { LazyIframe } from "@/components/ui/LazyIframe";

type Props = {
  embedSrc: string;
  title: string;
};

/** Карта подгружается при прокрутке к секции контактов */
export function YandexMap({ embedSrc, title }: Props) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-ink/5 md:aspect-[21/9]">
      <LazyIframe
        src={embedSrc}
        title={title}
        className="h-full w-full border-0"
        allowFullScreen
        rootMargin="400px"
        placeholder={
          <div className="flex h-full w-full items-center justify-center text-sm text-ink-muted">
            Карта загрузится при прокрутке
          </div>
        }
      />
    </div>
  );
}
