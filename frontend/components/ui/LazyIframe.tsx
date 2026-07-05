"use client";

import { useEffect, useRef, useState, type IframeHTMLAttributes, type ReactNode } from "react";

type Props = Omit<IframeHTMLAttributes<HTMLIFrameElement>, "src"> & {
  src: string;
  title: string;
  rootMargin?: string;
  placeholder?: ReactNode;
  wrapperClassName?: string;
};

export function LazyIframe({
  src,
  title,
  rootMargin = "300px",
  placeholder,
  wrapperClassName,
  className,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={wrapperClassName ?? "h-full w-full"}>
      {load ? (
        <iframe src={src} title={title} className={className} {...rest} />
      ) : (
        placeholder ?? <div className="h-full w-full bg-ink/5" aria-hidden />
      )}
    </div>
  );
}
