"use client";

import { useEffect, useRef } from "react";
import { optimizedSrc } from "@/lib/img";

const GLASS_POSTER = optimizedSrc("/media/glass-panels-poster.png", 960);

/**
 * The glass-panels studio video by default (Studio door card and Studio hero),
 * or any looping video: muted, inline, paused while off-screen.
 */
export function LoopVideo({
  className,
  webm = "",
  mp4 = "/media/glass-panels.mp4",
  poster = GLASS_POSTER,
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
