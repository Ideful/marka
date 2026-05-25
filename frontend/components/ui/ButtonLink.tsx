import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  variant?: "primary" | "glass" | "outline";
  size?: "md" | "lg";
};

export function ButtonLink({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-3 rounded-full font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  const sizes = size === "lg" ? "px-8 py-4 text-base min-h-[52px]" : "px-6 py-3 text-sm min-h-[44px]";

  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary: "bg-white text-ink hover:bg-white/90",
    glass:
      "border border-white/35 bg-white/12 text-white backdrop-blur-md hover:bg-white/18",
    outline:
      "border border-ink/15 bg-white text-ink hover:border-ink/25 hover:bg-sand",
  };

  return (
    <Link
      className={`${base} ${sizes} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
