"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, prefersReduced, ScrollTrigger } from "@/lib/motion";

let instance: Lenis | null = null;
export const getLenis = () => instance;

/** Lenis synced to the GSAP ticker. Disabled for reduced motion. */
export function SmoothScroll() {
  const pathname = usePathname();
  const popped = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    if (prefersReduced()) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    instance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      instance = null;
    };
  }, []);

  useEffect(() => {
    const pop = () => {
      popped.current = true;
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
    } else if (!popped.current) {
      if (instance) instance.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
    }
    popped.current = false;
    const id = requestAnimationFrame(() => {
      instance?.resize();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => {
      if (live) ScrollTrigger.refresh();
    });
    return () => {
      live = false;
    };
  }, []);

  return null;
}
