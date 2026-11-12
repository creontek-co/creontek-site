"use client";

import { useRef } from "react";
import { gsap, isMobile, prefersReduced, ScrollTrigger, useGSAP } from "@/lib/motion";
import { playMarqueeWord } from "@/lib/sound";

const WORDS = ["DESIGN", "BUILD", "AUTOMATE", "GROW"];
const BASE_SPEED = 60; // px per second

function Run({ hidden }: { hidden?: boolean }) {
  return (
    <span className="marquee-run" aria-hidden={hidden || undefined}>
      {WORDS.map((w) => (
        <span key={w}>
          {w}
          <i aria-hidden="true">·</i>
        </span>
      ))}
    </span>
  );
}

export function Marquee() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReduced()) return;
      const track = root.current!.querySelector<HTMLElement>(".marquee-track")!;
      const run = track.children[0] as HTMLElement;
      const mobile = isMobile();
      let x = 0;
      let dir = -1;
      let boost = 0;
      let lastWord = 0;

      const st = mobile
        ? null
        : ScrollTrigger.create({
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              if (self.direction) dir = self.direction > 0 ? -1 : 1;
              const v = Math.min(Math.abs(self.getVelocity()) / 60, 26);
              boost = Math.max(boost, v);
            },
          });

      const tick = (_t: number, delta: number) => {
        const dt = delta / 1000;
        const width = run.offsetWidth;
        if (!width) return;
        x += dir * (BASE_SPEED + boost * BASE_SPEED * 0.5) * dt;
        boost *= 0.93;
        x = gsap.utils.wrap(-width, 0, x);
        // Words chime as they pass, but only when the scroll is driving them.
        const word = Math.floor((-x / width) * WORDS.length);
        if (word !== lastWord) {
          lastWord = word;
          if (boost > 2) playMarqueeWord(word);
        }
        track.style.transform = `translate3d(${x}px,0,0)`;
      };
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        st?.kill();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="marquee paper" aria-label="Design, build, automate, grow">
      <div className="marquee-track" aria-hidden="true">
        <Run />
        <Run hidden />
        <Run hidden />
      </div>
    </section>
  );
}
