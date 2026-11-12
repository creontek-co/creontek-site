"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useEffect, useState } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

export const MOBILE_BP = 860;

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isMobile = () =>
  typeof window !== "undefined" && window.innerWidth < MOBILE_BP;

export const hasFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Low-power devices get the flat logo instead of WebGL (brief §9). */
export function isLowPower() {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection;
  return navigator.hardwareConcurrency < 4 || conn?.saveData === true;
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Linear progress of p through the segment a to b. */
export const seg = (p: number, a: number, b: number) =>
  clamp01((p - a) / (b - a));

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+·";
const rafs = new WeakMap<Element, number>();

/** Scramble-decode: random characters resolve left to right. */
export function scramble(el: HTMLElement | null, text: string, dur = 800) {
  if (!el) return;
  if (prefersReduced()) {
    el.textContent = text;
    return;
  }
  const prev = rafs.get(el);
  if (prev) cancelAnimationFrame(prev);
  const start = performance.now();
  const len = text.length;
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / dur);
    const done = Math.floor(p * len);
    let out = "";
    for (let i = 0; i < len; i++) {
      const c = text[i];
      out +=
        i < done || c === " " ? c : CHARS[(Math.random() * CHARS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) rafs.set(el, requestAnimationFrame(tick));
  };
  rafs.set(el, requestAnimationFrame(tick));
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Word markup used by the mask reveal, for text swapped in after hydration. */
export const wordsHtml = (text: string) =>
  text
    .split(" ")
    .map((w) => `<span class="w"><span class="wi">${escapeHtml(w)}</span></span>`)
    .join(" ");

/** The site-wide headline reveal (brief §4.1). */
export function maskIn(root: Element | Element[] | NodeListOf<Element>) {
  const targets =
    root instanceof Element
      ? root.querySelectorAll(".wi")
      : Array.from(root as ArrayLike<Element>);
  return gsap.fromTo(
    targets,
    { yPercent: 110 },
    {
      yPercent: 0,
      duration: 0.8,
      ease: "expo.out",
      stagger: 0.045,
      clearProps: "transform",
    },
  );
}

/**
 * Changes when the viewport width changes. Pass it to useGSAP dependencies for
 * animations built from measured layout. Height is ignored, so a phone's
 * collapsing toolbar never restarts anything.
 */
export function useWidthKey() {
  const [key, setKey] = useState(0);
  useEffect(() => {
    let id = 0;
    let last = window.innerWidth;
    const onResize = () => {
      clearTimeout(id);
      id = window.setTimeout(() => {
        if (window.innerWidth === last) return;
        last = window.innerWidth;
        setKey(last);
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return key;
}
