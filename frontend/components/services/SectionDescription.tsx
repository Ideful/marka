type Props = {
  text?: string;
};

export function SectionDescription({ text }: Props) {
  const content = text?.trim();
  if (!content) return null;

  return (
    <div className="text-center">
      <p className="whitespace-pre-wrap text-base leading-relaxed text-ink-muted md:text-lg">
        {content}
      </p>
    </div>
  );
}
