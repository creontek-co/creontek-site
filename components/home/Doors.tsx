"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useDoorTransition } from "@/components/shell/TransitionProvider";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { MaskHeading } from "@/components/ui/Reveal";
import {
  gsap,
  hasFinePointer,
  isMobile,
  prefersReduced,
  ScrollTrigger,
  useGSAP,
} from "@/lib/motion";

function MiniBlueprint() {
  const ref = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const svg = ref.current!;
      if (prefersReduced()) return;
      const q = gsap.utils.selector(svg);
      const md = q<SVGGeometryElement>(".md");
      md.forEach((p) => {
        const L = p.getTotalLength();
        p.style.strokeDasharray = `${L}`;
        p.style.strokeDashoffset = `${L}`;
      });
      gsap.set(q(".mf, .mp"), { opacity: 0 });
      gsap.set(q(".mp"), { scale: 0.3, transformOrigin: "50% 50%" });
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: true });
      tl.to(q(".mini-wall"), {
        strokeDashoffset: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power2.inOut",
      })
        .to(q(".mf"), { opacity: 1, duration: 0.4, stagger: 0.1 }, "-=.4")
        .to(
          q(".mp"),
          { opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: "back.out(2)" },
        )
        .to(
          q(".mini-sys"),
          { strokeDashoffset: 0, duration: 1, stagger: 0.1, ease: "power2.out" },
          "-=.3",
        )
        .to({}, { duration: 1.6 })
        .to(md, {
          strokeDashoffset: (_: number, t: SVGGeometryElement) =>
            t.getTotalLength(),
          duration: 0.8,
          ease: "power2.in",
        })
        .to(q(".mf, .mp"), { opacity: 0, duration: 0.4 }, "<");

      ScrollTrigger.create({
        trigger: svg,
        start: "top bottom",
        end: "bottom top",
        onToggle: (s) => (s.isActive ? tl.play() : tl.pause()),
      });
    },
    { scope: ref },
  );

  return (
    <svg
      ref={ref}
      viewBox="0 0 640 420"
      role="img"
      aria-label="A small floor plan drawing itself, with blue system lines connecting four rooms."
    >
      <path className="mini-wall md" d="M20 20 H620 V400 H20 Z" />
      <path className="mini-wall md" d="M320 20 V160 M320 206 V400" />
      <path className="mini-wall md" d="M20 210 H130 M176 210 H620" />
      <text className="mini-t mf" x="44" y="56">01 ATTRACT</text>
      <text className="mini-t mf" x="344" y="56">02 CONVERT</text>
      <text className="mini-t mf" x="44" y="380">03 FOLLOW UP</text>
      <text className="mini-t mf" x="344" y="380">04 OPERATE</text>
      <path className="mini-sys md" d="M296 210 H240 V140 H170" />
      <path className="mini-sys md" d="M344 210 H400 V140 H470" />
      <path className="mini-sys md" d="M296 210 H240 V280 H170" />
      <path className="mini-sys md" d="M344 210 H400 V280 H470" />
      <rect className="mp" x="156" y="133" width="14" height="14" fill="#2F5BFF" />
      <rect className="mp" x="470" y="133" width="14" height="14" fill="#2F5BFF" />
      <rect className="mp" x="156" y="273" width="14" height="14" fill="#2F5BFF" />
      <rect className="mp" x="470" y="273" width="14" height="14" fill="#2F5BFF" />
      <circle className="mp" cx="320" cy="210" r="24" fill="#2F5BFF" />
    </svg>
  );
}

export function Doors() {
  const row = useRef<HTMLDivElement>(null);
  const { enter } = useDoorTransition();

  useEffect(() => {
    const el = row.current;
    if (!el || !hasFinePointer() || isMobile() || prefersReduced()) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".door-card"));
    const offs = cards.map((d) => {
      const move = (e: PointerEvent) => {
        const r = d.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(d, {
          rotateY: x * 12,
          rotateX: -y * 12,
          duration: 0.6,
          ease: "power2.out",
        });
      };
      const leave = () =>
        gsap.to(d, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "power3.out" });
      d.addEventListener("pointermove", move);
      d.addEventListener("pointerleave", leave);
      return () => {
        d.removeEventListener("pointermove", move);
        d.removeEventListener("pointerleave", leave);
      };
    });
    return () => offs.forEach((off) => off());
  }, []);

  const open =
    (href: "/studio" | "/growth-engine") =>
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Let modified clicks open a new tab as normal.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      const card = e.currentTarget;
      const visual = card.querySelector<HTMLElement>(".door-vis");
      const other = card.parentElement?.querySelector<HTMLElement>(
        `.door-card:not([href="${href}"])`,
      );
      if (visual) enter({ href, card, visual, other });
    };

  return (
    <section className="doors paper" id="offers" aria-labelledby="doors-title">
      <div className="doors-head">
        <MaskHeading id="doors-title" text="Where do you want to start?" />
        <span className="mono">Choose a door</span>
      </div>
      <div ref={row} className="door-row">
        <Link
          href="/studio"
          className="door-card door-studio"
          onClick={open("/studio")}
        >
          <div className="door-vis">
            <LoopVideo className="door-video" />
          </div>
          <div className="door-meta">
            <span className="mono">Door 01</span>
            <h3>
              <b>Studio</b> — Exceptional digital experiences, engineered for
              business.
            </h3>
            <span className="go">
              Enter Studio <i />
            </span>
          </div>
        </Link>
        <Link
          href="/growth-engine"
          className="door-card door-ge"
          onClick={open("/growth-engine")}
        >
          <div className="door-vis ge-vis paper">
            <MiniBlueprint />
          </div>
          <div className="door-meta">
            <span className="mono">Door 02</span>
            <h3>
              <b>Growth Engine</b> — AI growth systems that attract, convert and
              grow.
            </h3>
            <span className="go">
              Enter Growth Engine <i />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
