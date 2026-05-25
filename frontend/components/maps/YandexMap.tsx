type Props = {
  embedSrc: string;
  title: string;
};

/** Встроенная карта; overlay снимается по тапу — удобно на тач-устройствах */
export function YandexMap({ embedSrc, title }: Props) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-ink/5 md:aspect-[21/9]">
      <iframe
        src={embedSrc}
        title={title}
        className="h-full w-full border-0"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}
