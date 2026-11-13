"use client";

import { useEffect, useRef } from "react";
import { BookButton, Pill } from "@/components/ui/Buttons";
import { LoopVideo } from "@/components/ui/LoopVideo";
import { optimizedSrc } from "@/lib/img";
import {
  gsap,
  hasFinePointer,
  isMobile,
  prefersReduced,
  useGSAP,
  useWidthKey,
} from "@/lib/motion";
import { PROJECTS } from "@/lib/site";
import { playConsidered, playTrail } from "@/lib/sound";
import { whenStageClear } from "@/lib/stage";

const TRAIL_STEP = 80;
const TRAIL_LIFE = 0.9;
const TRAIL_POOL = 14;
/** How dark the video gets behind "Every pixel, considered." (0 to 1). */
const DIM_LEVEL = 0.45;

function HeadWords({ text, side }: { text: string; side: string }) {
  return (
    <>
      {text.split(" ").map((w) => (
        <span key={w} className="g-word" data-side={side}>
          {w}{" "}
        </span>
      ))}
    </>
  );
}

export function GalleryHero() {
  const root = useRef<HTMLElement>(null);
  const widthKey = useWidthKey();

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!;
      const q = gsap.utils.selector(el);
      el.dataset.ready = "1";
      if (prefersReduced()) return;

      const words = q<HTMLElement>(".g-word");
      const video = q<HTMLElement>(".g-window")[0];
      const frame = q<HTMLElement>(".g-frame")[0];
      const caption = q<HTMLElement>(".g-caption")[0];
      const closing = q<HTMLElement>(".g-closing")[0];
      const dim = q<HTMLElement>(".g-dim")[0];
      const ctas = q<HTMLElement>(".g-ctas")[0];

      // The window is the full-bleed video, clipped down to the frame's box.
      const inset = { t: 0, r: 0, b: 0, l: 0 };
      const measure = () => {
        const box = el.querySelector(".g-sticky")!.getBoundingClientRect();
        const f = frame.getBoundingClientRect();
        // getBoundingClientRect includes the frame's current scale; undo it.
        const sx = Number(gsap.getProperty(frame, "scaleX")) || 1;
        const sy = Number(gsap.getProperty(frame, "scaleY")) || 1;
        const w = f.width / sx;
        const h = f.height / sy;
        const cx = f.left + f.width / 2 - box.left;
        const cy = f.top + f.height / 2 - box.top;
        return {
          t: cy - h / 2,
          l: cx - w / 2,
          r: box.width - (cx + w / 2),
          b: box.height - (cy + h / 2),
          W: box.width,
          H: box.height,
          w,
          h,
          cx,
          cy,
        };
      };

      const m = measure();
      inset.t = m.t;
      inset.r = m.r;
      inset.b = m.b;
      inset.l = m.l;
      const apply = () => {
        video.style.clipPath = `inset(${inset.t}px ${inset.r}px ${inset.b}px ${inset.l}px)`;
      };
      apply();

      gsap.set(words, { opacity: 0, y: 14, filter: "blur(8px)" });
      gsap.set([caption, ctas], { opacity: 0, y: 8 });
      gsap.set(closing, { opacity: 0, y: 16 });

      const intro = contextSafe!(() => {
        gsap.to(words, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.09,
          // Clear the filter so scrolling never repaints blurred text.
          onComplete: () => {
            gsap.set(words, { clearProps: "filter" });
          },
        });
        gsap.to(caption, { opacity: 1, y: 0, duration: 1, delay: 0.6 });
        gsap.to(ctas, { opacity: 1, y: 0, duration: 1, delay: 0.8 });
      });
      const stop = whenStageClear(intro);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (s) => {
            if (s.progress > 0.76) playConsidered();
          },
        },
      });

      tl.to(inset, { t: 0, r: 0, b: 0, l: 0, duration: 0.72, onUpdate: apply }, 0);
      tl.to(
        frame,
        {
          scaleX: m.W / m.w,
          scaleY: m.H / m.h,
          x: m.W / 2 - m.cx,
          y: m.H / 2 - m.cy,
          duration: 0.72,
        },
        0,
      );
      tl.to(frame, { opacity: 0, duration: 0.2 }, 0.52);
      tl.to([caption, ctas], { opacity: 0, duration: 0.14 }, 0);

      // The serif words drift apart from the frame.
      words.forEach((w) => {
        const side = w.dataset.side;
        tl.to(
          w,
          {
            x: side === "left" ? -140 : side === "right" ? 140 : 0,
            y: side === "below" ? 90 : 0,
            opacity: 0,
            duration: 0.34,
          },
          0.02,
        );
      });
      // The video darkens just before the white line arrives, so it reads clearly.
      tl.to(dim, { opacity: DIM_LEVEL, duration: 0.14 }, 0.66);
      tl.to(closing, { opacity: 1, y: 0, duration: 0.14 }, 0.76);
      tl.to({}, { duration: 0.1 });

      return () => stop();
    },
    { scope: root, dependencies: [widthKey], revertOnUpdate: true },
  );

  // Cursor image trail: one screenshot per 80px of travel, each living 0.9s.
  useEffect(() => {
    const el = root.current;
    const pool = el?.querySelector<HTMLElement>(".g-trail");
    if (!el || !pool || !hasFinePointer() || isMobile() || prefersReduced())
      return;
    const nodes = Array.from(pool.children) as HTMLElement[];
    let index = 0;
    let lastX = 0;
    let lastY = 0;
    let armed = false;

    const move = (e: PointerEvent) => {
      if (window.scrollY > window.innerHeight * 0.1) return;
      const b = el.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      if (!armed) {
        armed = true;
        lastX = x;
        lastY = y;
        return;
      }
      if (Math.hypot(x - lastX, y - lastY) < TRAIL_STEP) return;
      lastX = x;
      lastY = y;
      playTrail();
      const n = nodes[index++ % nodes.length];
      gsap.killTweensOf(n);
      gsap.set(n, {
        x: x - n.offsetWidth / 2,
        y: y - n.offsetHeight / 2,
        opacity: 0,
        scale: 0.9,
        rotation: gsap.utils.random(-5, 5),
      });
      gsap
        .timeline()
        .to(n, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" })
        .to(n, { opacity: 0, scale: 0.96, duration: 0.45 }, TRAIL_LIFE - 0.45);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);

  return (
    <section ref={root} className="g-hero">
      <div className="g-sticky">
        <div className="g-trail" aria-hidden="true">
          {Array.from({ length: TRAIL_POOL }, (_, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={optimizedSrc(PROJECTS[i % PROJECTS.length].image, 256)}
              alt=""
            />
          ))}
        </div>

        <h1 className="g-title" data-intro="">
          <span className="g-left">
            <HeadWords text="Exceptional digital" side="left" />
          </span>{" "}
          <span className="g-right">
            <HeadWords text="experiences," side="right" />
          </span>{" "}
          <span className="g-below">
            <em>
              <HeadWords text="engineered for business." side="below" />
            </em>
          </span>
        </h1>

        <LoopVideo className="g-window" />
        <div className="g-frame" aria-hidden="true" />
        <p className="g-caption">
          Studio, 2026 · Digital experiences · Ongoing
        </p>

        <div className="g-ctas" data-intro="">
          <BookButton />
          <Pill href="/work">View work</Pill>
        </div>

        <div className="g-dim" aria-hidden="true" />
        <p className="g-closing">Every pixel, considered.</p>
      </div>
    </section>
  );
}
