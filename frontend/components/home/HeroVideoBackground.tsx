"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/video.MP4";
const POSTER_SRC = "/hero-poster.jpg";

function canPlayVideo(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(min-width: 1024px)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (connection?.saveData) return false;

  return true;
}

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const armedRef = useRef(false);
  const [videoEnabled, setVideoEnabled] = useState(false);

  useEffect(() => {
    setVideoEnabled(canPlayVideo());
  }, []);

  useEffect(() => {
    if (!videoEnabled) return;

    const hero = document.getElementById("hero");
    const video = videoRef.current;
    if (!hero || !video) return;

    const armVideo = () => {
      if (armedRef.current) return;
      armedRef.current = true;
      video.src = VIDEO_SRC;
      video.load();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false;

        if (visible && !armedRef.current) {
          const arm = () => armVideo();
          if (typeof requestIdleCallback === "function") {
            requestIdleCallback(arm, { timeout: 2500 });
          } else {
            setTimeout(arm, 1500);
          }
        }

        if (!armedRef.current) return;

        if (visible) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [videoEnabled]);

  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: `url(${POSTER_SRC})` }}
        aria-hidden
      />
      {videoEnabled ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          muted
          loop
          playsInline
          preload="none"
          poster={POSTER_SRC}
        />
      ) : null}
    </>
  );
}
