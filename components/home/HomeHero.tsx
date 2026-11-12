"use client";

import { useEffect, useRef, useState } from "react";
import { Pill } from "@/components/ui/Buttons";
import { LogoSymbol } from "@/components/ui/Logo";
import { Words } from "@/components/ui/Words";
import {
  clamp01,
  gsap,
  isLowPower,
  maskIn,
  prefersReduced,
  seg,
  useGSAP,
} from "@/lib/motion";
import { playChimes, setScrub } from "@/lib/sound";
import { heroState } from "./hero-state";
import { Preloader } from "./Preloader";

const STATEMENT =
  "Most businesses don't need more technology. They need technology that works as hard as they do.";

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function HomeHero() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [flat, setFlat] = useState(false);

  // Boot the 3D logo, dynamically imported so it never blocks the page.
  useEffect(() => {
    heroState.p = 0;
    heroState.slide = 0;
    heroState.ready = false;
    heroState.settled = false;
    let dispose: (() => void) | undefined;
    let dead = false;

    const fallback = () => {
      setFlat(true);
      heroState.ready = true;
      heroState.settled = true;
    };

    if (prefersReduced() || isLowPower() || !webglAvailable()) {
      fallback();
      return;
    }
    import("./hero-scene")
      .then(({ createHeroScene }) => {
        if (dead || !canvas.current) return;
        return createHeroScene(canvas.current);
      })
      .then((stop) => {
        if (dead) stop?.();
        else dispose = stop;
      })
      .catch(fallback);

    return () => {
      dead = true;
      dispose?.();
    };
  }, []);

  useGSAP(
    () => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      if (prefersReduced()) return;

      const hA = q<HTMLElement>(".h-a")[0];
      const hB = q<HTMLElement>(".h-b")[0];
      const hC = q<HTMLElement>(".h-c")[0];
      const words = q<HTMLElement>(".h-b .bw");
      const bars = q<HTMLElement>(".home-shutter span");
      const grid = q<HTMLElement>(".home-shutter-grid")[0];
      let chimed = false;
      let active = false;

      const apply = (p: number) => {
        heroState.p = p;
        const a = 1 - seg(p, 0.12, 0.24);
        hA.style.opacity = String(a);
        hA.style.transform = `translateY(${-40 * (1 - a)}px)`;
        hA.style.visibility = a === 0 ? "hidden" : "";

        const b = Math.min(seg(p, 0.2, 0.28), 1 - seg(p, 0.5, 0.58));
        hB.style.opacity = String(b);
        const wp = seg(p, 0.26, 0.5) * words.length;
        words.forEach((w, i) => {
          w.style.opacity = String(0.16 + 0.84 * clamp01(wp - i));
        });

        hC.style.opacity = String(Math.min(seg(p, 0.62, 0.7), 1 - seg(p, 0.86, 0.95)));

        // On portrait screens the logo is dimmed behind the text until the
        // text has gone and it can break apart at full brightness.
        el.style.setProperty("--logo-lift", String(seg(p, 0.5, 0.62)));

        // The shutter wipes into paper, leading straight into the doors.
        bars.forEach((bar, i) => {
          bar.style.transform = `scaleY(${seg(p, 0.8 + i * 0.02, 0.86 + i * 0.02)})`;
        });
        grid.style.opacity = String(seg(p, 0.985, 1));

        const breaking = seg(p, 0.5, 0.62) * (1 - seg(p, 0.8, 0.95));
        if (active) setScrub(breaking, 700 + 1500 * seg(p, 0.5, 0.9));
        if (p > 0.55 && !chimed) {
          chimed = true;
          playChimes();
        } else if (p < 0.5) {
          chimed = false;
        }
      };

      apply(0);
      gsap.to(
        {},
        {
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onToggle: (s) => {
              active = s.isActive;
              if (!active) setScrub(0);
            },
            onUpdate: (s) => apply(s.progress),
          },
        },
      );
    },
    { scope: root },
  );

  const heroIn = () => {
    const el = root.current;
    if (!el) return;
    el.dataset.ready = "1";
    if (prefersReduced()) {
      heroState.intro = 1;
      heroState.slide = 1;
      return;
    }
    const h1 = el.querySelector("h1");
    if (h1) maskIn(h1);
    gsap.fromTo(
      el.querySelectorAll(".hero-rest"),
      { opacity: 0, y: 14 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.35,
        ease: "power3.out",
        stagger: 0.1,
      },
    );
    gsap.to(heroState, { intro: 1, duration: 1.6, ease: "power3.out" });
    // The logo appears at centre, where the preloader's logo was, then glides
    // right to rest beside (desktop) or partly behind (mobile) the text.
    gsap.fromTo(
      heroState,
      { slide: 0 },
      { slide: 1, duration: 1.5, delay: 0.45, ease: "power3.inOut" },
    );
  };

  return (
    <>
      <Preloader onReveal={heroIn} />
      <section ref={root} className="home" aria-label="CreonTek">
        <div className="home-sticky">
          <canvas
            ref={canvas}
            className="hero-gl"
            aria-hidden="true"
            hidden={flat}
          />
          {flat ? <LogoSymbol className="hero-flat" /> : null}

          <div className="h-layer h-a">
            <h1 data-intro="">
              <Words text="We build technology that moves businesses forward." />
            </h1>
            <p className="hero-rest">
              Exceptional digital experiences and AI growth systems for businesses
              that refuse to stand still.
            </p>
            <div className="h-ctas hero-rest">
              <Pill href="/studio">Explore Studio</Pill>
              <Pill href="/growth-engine">Explore Growth Engine</Pill>
            </div>
            <div className="h-foot hero-rest">
              <div className="cue mono">
                <b />
                Scroll
              </div>
              <span className="hero-quote">
                &ldquo;The best way to predict the future is to create it.&rdquo;
              </span>
            </div>
          </div>

          <div className="h-layer h-b">
            <p>
              {STATEMENT.split(" ").map((w, i, all) => (
                <span key={i}>
                  <span className="bw">{w}</span>
                  {i < all.length - 1 ? " " : null}
                </span>
              ))}
            </p>
          </div>

          <div className="h-layer h-c">
            <span className="mono">Two offers · One standard</span>
            <h2>
              Two ways we move <br />
              businesses forward.
            </h2>
          </div>

          <div className="home-shutter" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} />
            ))}
            <div className="home-shutter-grid paper" />
          </div>
        </div>
      </section>
    </>
  );
}
