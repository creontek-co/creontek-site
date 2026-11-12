"use client";

import { useEffect, useRef } from "react";
import { gsap, hasFinePointer, prefersReduced } from "@/lib/motion";

/**
 * Hover list helper: an image that follows the cursor over the element
 * returned as `listRef`. Set the active row by calling show(src).
 */
export function useCursorImage() {
  const listRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const box = boxRef.current;
    if (!list || !box || !hasFinePointer() || prefersReduced()) return;
    const x = gsap.quickTo(box, "x", { duration: 0.6, ease: "power3.out" });
    const y = gsap.quickTo(box, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      x(e.clientX + 24);
      y(e.clientY - box.offsetHeight / 2);
    };
    const leave = () =>
      gsap.to(box, { opacity: 0, scale: 0.92, duration: 0.3, overwrite: "auto" });
    list.addEventListener("pointermove", move);
    list.addEventListener("pointerleave", leave);
    return () => {
      list.removeEventListener("pointermove", move);
      list.removeEventListener("pointerleave", leave);
    };
  }, []);

  const show = (src: string) => {
    const box = boxRef.current;
    if (!box || !hasFinePointer() || prefersReduced()) return;
    if (imgRef.current) imgRef.current.src = src;
    gsap.to(box, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  const node = (
    <div ref={boxRef} className="cursor-image" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imgRef} alt="" />
    </div>
  );

  return { listRef, show, node };
}
