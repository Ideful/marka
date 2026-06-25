type Props = {
  text: string;
};

export function MarqueeBar({ text }: Props) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const segment = ` ${trimmed} · `;
  const line = segment.repeat(12);

  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 overflow-hidden bg-ink-muted pb-[env(safe-area-inset-bottom,0px)] text-white shadow-[0_-4px_12px_rgba(0,0,0,0.12)]"
      aria-hidden
    >
      <div className="flex h-12 items-center">
        <div className="animate-marquee flex w-max shrink-0 whitespace-nowrap font-semibold uppercase tracking-[0.35em]">
          <span className="px-2">{line}</span>
          <span className="px-2">{line}</span>
        </div>
      </div>
    </div>
  );
}
