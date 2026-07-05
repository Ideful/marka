"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/video.MP4";
const POSTER_SRC = "/hero-poster.jpg";

function shouldPlayVideo(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (connection?.saveData) return false;

  return true;
}

export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    setPlayVideo(shouldPlayVideo());
  }, []);

  useEffect(() => {
    if (!playVideo) return;

    const hero = document.getElementById("hero");
    const video = videoRef.current;
    if (!hero || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false;
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
  }, [playVideo]);

  if (!playVideo) {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: `url(${POSTER_SRC})` }}
        aria-hidden
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover opacity-50"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={POSTER_SRC}
    >
      <source src={VIDEO_SRC} type="video/mp4" />
    </video>
  );
}
