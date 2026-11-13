"use client";

import { useEffect, useRef } from "react";
import { gsap, hasFinePointer, isMobile, prefersReduced } from "@/lib/motion";

/**
 * Desktop cursor: an 8px dot that grows into a 64px labelled ring over any
 * element with data-cursor="Label". Areas with their own cursor set
 * data-cursor-none.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = dot.current;
    if (!el || !hasFinePointer() || isMobile() || prefersReduced()) return;
    document.documentElement.classList.add("has-cursor");
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const x = gsap.quickTo(el, "x", { duration: 0.25, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.25, ease: "power3.out" });
    let seen = false;

    const move = (e: PointerEvent) => {
      if (!seen) {
        seen = true;
        gsap.set(el, { x: e.clientX, y: e.clientY });
        el.dataset.on = "1";
      }
      x(e.clientX);
      y(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t?.closest) return;
      // Dropdown menus are native popups a custom cursor can't follow.
      // Social buttons fill and lift on hover, which marks the pointer on its
      // own; the dot would only invert the logo inside them.
      el.dataset.hidden = t.closest("[data-cursor-none], select, .socials a")
        ? "1"
        : "";
      const hit = t.closest<HTMLElement>("[data-cursor]");
      if (hit?.dataset.cursor) {
        if (label.current) label.current.textContent = hit.dataset.cursor;
        el.dataset.ring = "1";
        el.dataset.link = "";
      } else {
        el.dataset.ring = "";
        el.dataset.link = t.closest("a,button,input,textarea,[role=tab]")
          ? "1"
          : "";
      }
    };

    const leave = () => {
      el.dataset.on = "";
      seen = false;
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div ref={dot} className="cursor" aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
