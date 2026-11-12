"use client";

import { useRef } from "react";
import { MaskHeading } from "@/components/ui/Reveal";
import { gsap, prefersReduced, ScrollTrigger, useGSAP } from "@/lib/motion";
import { HOW_WE_WORK } from "@/lib/site";
import { playStack, playStackBack } from "@/lib/sound";

export function HowWeWork() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReduced()) return;
      const cards = gsap.utils.toArray<HTMLElement>(".how-card", root.current);
      cards.forEach((card, i) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top 16%",
          onEnter: () => playStack(i),
          onLeaveBack: playStackBack,
        });
      });
      cards.slice(0, -1).forEach((card, i) => {
        // Only the content dims: the card stays opaque so nothing shows through.
        gsap.to(card.children, {
          opacity: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
        gsap.to(card, {
          scale: 0.94,
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    },
    { scope: root },
  );

  const total = String(HOW_WE_WORK.length).padStart(2, "0");

  return (
    <section ref={root} className="how" aria-labelledby="how-title">
      <MaskHeading id="how-title" className="how-title" text="How we work" />
      <div className="how-stack">
        {HOW_WE_WORK.map((c, i) => (
          <article key={c.title} className="how-card">
            <span className="mono">
              0{i + 1} / {total}
            </span>
            <h3>{c.title}</h3>
            <p>{c.line}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
