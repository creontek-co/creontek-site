"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { gsap, isMobile, prefersReduced, useGSAP, useWidthKey } from "@/lib/motion";
import { PROJECTS } from "@/lib/site";
import { setScrub } from "@/lib/sound";

const ARC = 26; // degrees between neighbouring cards on the curve

/** A curved 3D carousel of screenshots that flattens into a grid on scroll. */
export function WorkGallery() {
  const root = useRef<HTMLElement>(null);
  const widthKey = useWidthKey();

  useGSAP(
    () => {
      if (prefersReduced()) return;
      const el = root.current!;
      const cards = gsap.utils.toArray<HTMLElement>(".s-shot", el);
      const stage = el.querySelector<HTMLElement>(".s-gallery-stage")!;
      const mobile = isMobile();
      const stageBox = stage.getBoundingClientRect();
      const cx = stageBox.left + stageBox.width / 2;
      const cy = stageBox.top + stageBox.height / 2;
      const radius = Math.min(window.innerWidth * 0.62, 900);
      const mid = (cards.length - 1) / 2;

      // The grid is the real layout, so every card starts from the curve.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onToggle: (s) => {
            if (!s.isActive) setScrub(0);
          },
          onUpdate: (s) =>
            setScrub(0.3 * (1 - s.progress), 340 + s.progress * 800),
        },
      });
      cards.forEach((card, i) => {
        const b = card.getBoundingClientRect();
        const dx = cx - (b.left + b.width / 2);
        const dy = cy - (b.top + b.height / 2);
        const angle = ((i - mid) * ARC * Math.PI) / 180;
        tl.fromTo(
          card,
          {
            x: dx + Math.sin(angle) * radius * (mobile ? 0.55 : 1),
            y: dy,
            z: (Math.cos(angle) - 1) * radius,
            rotateY: (angle * 180) / Math.PI,
            scale: mobile ? 0.9 : 1.08,
          },
          { x: 0, y: 0, z: 0, rotateY: 0, scale: 1, duration: 1 },
          0,
        );
      });
      tl.to({}, { duration: 0.25 });
    },
    { scope: root, dependencies: [widthKey], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="s-gallery" aria-label="Work gallery">
      <div className="s-gallery-sticky">
        <div className="s-gallery-stage">
          {PROJECTS.map((p) => (
            <Link key={p.slug} href={`/work/${p.slug}`} className="s-shot" data-cursor="View">
              <Image src={p.image} alt={`${p.title}, ${p.industry}`} fill sizes="(max-width: 860px) 45vw, 30vw" unoptimized />
              {p.placeholder ? <span>Placeholder</span> : null}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
