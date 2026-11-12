"use client";

import { useEffect, useRef } from "react";

/** V4, or any looping video: muted, inline, paused while off-screen. */
export function LoopVideo({
  className,
  webm = "/media/v4-studio.webm",
  mp4 = "/media/v4-studio.mp4",
  poster = "/media/v4-poster.jpg",
}: {
  className?: string;
  webm?: string;
  mp4?: string;
  poster?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => {
      io.disconnect();
      v.pause();
    };
  }, []);
  return (
    <video
      ref={ref}
      className={className}
      muted
      playsInline
      loop
      autoPlay
      preload="metadata"
      poster={poster}
      aria-hidden="true"
      tabIndex={-1}
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
