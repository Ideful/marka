import Link from "next/link";
import Image from "next/image";

type Props = {
  onClick?: () => void;
  className?: string;
};

export function SiteLogo({ onClick, className = "" }: Props) {
  return (
    <Link
      href="/"
      className={`inline-flex min-h-[44px] min-w-[44px] items-center ${className}`}
      onClick={onClick}
      aria-label="Марка — на главную"
    >
      <Image
        src="/icons/logo.png"
        alt="Марка"
        width={200}
        height={60}
        className="h-9 w-auto max-w-[10rem] object-contain object-left md:h-10 md:max-w-[12rem]"
        priority
      />
    </Link>
  );
}
