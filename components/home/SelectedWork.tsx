"use client";

import Link from "next/link";
import { useRef } from "react";
import { getLenis } from "@/components/shell/SmoothScroll";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { MaskHeading } from "@/components/ui/Reveal";
import { gsap, isMobile, prefersReduced, useGSAP, useWidthKey } from "@/lib/motion";
import { PROJECTS } from "@/lib/site";
import { playCardPass, setScrub } from "@/lib/sound";

export function SelectedWork() {
  const root = useRef<HTMLElement>(null);
  const widthKey = useWidthKey();
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReduced() || isMobile()) return;
      const section = root.current!;
      const rail = track.current!;
      const parent = rail.parentElement!;
      const distance = () =>
        Math.max(0, rail.scrollWidth - parent.clientWidth);

      section.style.setProperty("--travel", `${distance()}px`);
      let lastCard = 0;
      const tween = gsap.to(rail, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.4,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const card = Math.round(self.progress * (PROJECTS.length - 1));
            if (card !== lastCard) {
              lastCard = card;
              playCardPass(card);
            }
          },
          onRefresh: () =>
            section.style.setProperty("--travel", `${distance()}px`),
        },
      });

      // Dragging the gallery scrolls the page, so both inputs agree.
      let startX = 0;
      let startScroll = 0;
      let dragging = false;
      let moved = false;
      const down = (e: PointerEvent) => {
        dragging = true;
        setScrub(0.35, 1100);
        moved = false;
        startX = e.clientX;
        startScroll = window.scrollY;
      };
      const move = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        const to = startScroll - dx;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(to, { immediate: true, force: true });
        else window.scrollTo(0, to);
      };
      const up = () => {
        if (dragging) setScrub(0);
        dragging = false;
      };
      const click = (e: MouseEvent) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      const noDrag = (e: Event) => e.preventDefault();
      parent.addEventListener("pointerdown", down);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      parent.addEventListener("click", click, true);
      parent.addEventListener("dragstart", noDrag);

      return () => {
        parent.removeEventListener("pointerdown", down);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        parent.removeEventListener("click", click, true);
        parent.removeEventListener("dragstart", noDrag);
        tween.scrollTrigger?.kill();
        section.style.removeProperty("--travel");
      };
    },
    { scope: root, dependencies: [widthKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="work paper" aria-labelledby="work-title">
      <div className="work-sticky">
        <div className="work-left">
          <MaskHeading id="work-title" text="Selected work & explorations" />
          <Link className="text-link" href="/work">
            View all
          </Link>
        </div>
        <div className="work-rail" data-cursor="Drag">
          <div ref={track} className="work-track">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
