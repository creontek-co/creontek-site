"use client";

import { useEffect, useRef } from "react";
import { getLenis } from "@/components/shell/SmoothScroll";
import { LOGO_PIECES, WORD_LETTERS } from "@/lib/logo-paths";
import { gsap, prefersReduced, ScrollTrigger } from "@/lib/motion";
import { playBurst, playLetter, playLock, playPiece } from "@/lib/sound";
import { INTRO_FLAG, REPLAY_EVENT } from "@/lib/stage";
import { heroState } from "./hero-state";

// Where the symbol sits in the wordmark, so it lands exactly on the "C".
const SYM_FIT = "translate(238.84 753.84) scale(0.25394)";
const SYM_INNER_SCALE = 0.25394;
const SYM_CX = 321.5;
const SYM_CY = 840;
const SYM_DX = 460.5;
const START_SCALE = 2.1;
const VB_W = 1100;

const SYM_START = `translate(${SYM_DX} 0) translate(${SYM_CX} ${SYM_CY}) scale(${START_SCALE}) translate(${-SYM_CX} ${-SYM_CY})`;

const ASSEMBLE_MS = 1250;
const MAX_WAIT_MS = 3200;
const MAX_HOLD_MS = 1500;

// An effect re-run (StrictMode, Activity) must not read as "the intro is over",
// so the cleanup's unlock is deferred and a re-mount cancels it.
let pendingUnlock = 0;

// Ring halves first, then bars light, mid, dark.
const ORDER = [0, 1, 6, 7, 4, 5, 2, 3];

/** Assemble → Scatter, built from the logo's 8 SVG pieces. */
export function Preloader({ onReveal }: { onReveal: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const reveal = useRef(onReveal);
  useEffect(() => {
    reveal.current = onReveal;
  });

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    window.clearTimeout(pendingUnlock);
    const html = document.documentElement;
    const q = gsap.utils.selector(el);
    let raf = 0;
    let ctx: gsap.Context | null = null;
    let timer = 0;

    const unlock = () => {
      // Marked as seen only once it has actually played, so an intro that was
      // interrupted (reload, tab discarded, page prerendered) plays next time.
      try {
        sessionStorage.setItem(INTRO_FLAG, "1");
      } catch {}
      html.removeAttribute("data-preload");
      getLenis()?.start();
      ScrollTrigger.refresh();
    };

    const skip = () => {
      unlock();
      reveal.current();
    };

    const run = () => {
      (window as unknown as { __ctPre: boolean }).__ctPre = true;
      html.setAttribute("data-preload", "1");
      window.scrollTo(0, 0);
      // Lenis mounts after this effect on first load, so stop it a tick later.
      timer = window.setTimeout(() => getLenis()?.stop(), 0);

      ctx?.revert();
      ctx = gsap.context(() => {
        const pieces = q<SVGPathElement>(".pre-piece");
        const letters = q<SVGPathElement>(".pre-letter");
        const symMove = q<SVGGElement>(".pre-sym")[0];
        const symInner = q<SVGGElement>(".pre-sym-inner")[0];
        const count = q<HTMLElement>(".pre-count")[0];
        const sweep = q<HTMLElement>(".pre-sweep")[0];
        const logo = q<SVGSVGElement>(".pre-logo")[0];
        const top = q<HTMLElement>(".pre-top")[0];
        const bot = q<HTMLElement>(".pre-bot")[0];

        // The screen splits along a diagonal matching the bar slant.
        const slant = (0.288 * window.innerWidth) / window.innerHeight;
        const a = 50 - (slant * 100) / 2;
        const b = 50 + (slant * 100) / 2;
        top.style.clipPath = `polygon(0 0,100% 0,100% ${b + 0.4}%,0 ${a + 0.4}%)`;
        bot.style.clipPath = `polygon(0 ${a}%,100% ${b}%,100% 100%,0 100%)`;

        // Scatter distances in the brief are px: convert to the pieces' units.
        const pxToUnits =
          VB_W / logo.getBoundingClientRect().width / SYM_INNER_SCALE / START_SCALE;

        const symK = { k: 0 };
        const setSym = () => {
          const { k } = symK;
          const sc = START_SCALE - (START_SCALE - 1) * k;
          symMove.setAttribute(
            "transform",
            `translate(${SYM_DX * (1 - k)} 0) translate(${SYM_CX} ${SYM_CY}) scale(${sc}) translate(${-SYM_CX} ${-SYM_CY})`,
          );
        };
        setSym();

        gsap.set(letters, {
          opacity: 0,
          y: 40,
          x: 0,
          rotation: 0,
          transformOrigin: "50% 50%",
        });
        gsap.set(sweep, { scaleX: 0, opacity: 1 });
        gsap.set(q(".pre-half"), { yPercent: 0 });
        gsap.set(q(".pre-note, .pre-count"), { opacity: 1 });

        const ib = symInner.getBBox();
        const cx = ib.x + ib.width / 2;
        const cy = ib.y + ib.height / 2;
        const centres = pieces.map((p) => {
          const b2 = p.getBBox();
          return { x: b2.x + b2.width / 2 - cx, y: b2.y + b2.height / 2 - cy };
        });

        pieces.forEach((p) =>
          gsap.set(p, {
            x: gsap.utils.random(-520, 520) * pxToUnits,
            y: gsap.utils.random(-340, 340) * pxToUnits,
            rotation: gsap.utils.random(-140, 140),
            opacity: 0.22,
            fill: "#6E6C67",
            transformOrigin: "50% 50%",
          }),
        );

        const assemble = gsap.timeline({ paused: true });
        ORDER.forEach((idx, k) => {
          const p = pieces[idx];
          assemble
            .to(
              p,
              {
                x: 0,
                y: 0,
                rotation: 0,
                opacity: 1,
                duration: 0.9,
                ease: "back.out(1.4)",
              },
              k * 0.16,
            )
            .to(p, { fill: "#FFFFFF", duration: 0.3 }, k * 0.16 + 0.6)
            .call(playPiece, [k], k * 0.16 + 0.55);
        });

        const prog = { v: 0, loaded: false };
        const begun = performance.now();
        let t0 = 0;
        const loaded = () => {
          prog.loaded = true;
        };
        if (document.readyState === "complete") loaded();
        else window.addEventListener("load", loaded, { once: true });

        const scatter = () => {
          const tl = gsap.timeline({ onComplete: unlock });
          tl.to(symK, { k: 1, duration: 0.9, ease: "expo.inOut", onUpdate: setSym }, "+=.05")
            .to(
              letters,
              {
                opacity: 1,
                y: 0,
                duration: 0.55,
                ease: "expo.out",
                stagger: 0.05,
              },
              "-=.5",
            )
            .add(() => {
              letters.forEach((_, i) => gsap.delayedCall(i * 0.05, playLetter, [i]));
            }, "<")
            .add(playLock, "-=.25")
            .to(sweep, { scaleX: 1, duration: 0.4, ease: "power2.out" }, "<")
            .to(sweep, { opacity: 0, duration: 0.2 }, "+=.05")
            .addLabel("burst", "-=.1")
            .add(playBurst, "burst")
            .to(
              pieces,
              {
                x: (i: number) =>
                  centres[i].x * (i < 2 ? 3.4 : 0) +
                  (i >= 2 ? (i % 2 ? 1 : -1) * gsap.utils.random(1400, 2400) : 0),
                y: (i: number) =>
                  centres[i].y * (i < 2 ? 3.8 : 0) +
                  (i >= 2 ? (i % 2 ? 1 : -1) * gsap.utils.random(400, 700) : 0),
                rotation: (i: number) =>
                  (i % 2 ? 1 : -1) * gsap.utils.random(40, 120),
                opacity: 0,
                duration: 0.75,
                ease: "power3.in",
                stagger: 0.02,
              },
              "burst",
            )
            .to(
              letters,
              {
                x: () => gsap.utils.random(-260, 260),
                y: (i: number) => (i % 2 ? 1 : -1) * gsap.utils.random(140, 320),
                rotation: () => gsap.utils.random(-70, 70),
                opacity: 0,
                duration: 0.7,
                ease: "power3.in",
                stagger: { each: 0.03, from: "center" },
              },
              "burst+=.05",
            )
            .to(q(".pre-note, .pre-count"), { opacity: 0, duration: 0.3 }, "burst")
            .to(top, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "burst+=.2")
            .to(bot, { yPercent: 100, duration: 0.9, ease: "expo.inOut" }, "burst+=.2")
            .add(() => reveal.current(), "burst+=.4");
        };

        const tick = () => {
          const now = performance.now();
          // Pieces hold their scattered positions until the scene has settled.
          if (!t0) {
            if (!heroState.settled && now - begun < MAX_HOLD_MS) {
              raf = requestAnimationFrame(tick);
              return;
            }
            t0 = now;
          }
          const elapsed = now - t0;
          const done =
            (prog.loaded && heroState.ready) || elapsed >= MAX_WAIT_MS;
          // Held short of 100 until the page and 3D scene are really ready.
          const target = Math.min(elapsed / ASSEMBLE_MS, done ? 1 : 0.86);
          prog.v += (target - prog.v) * 0.2;
          if (target === 1 && prog.v > 0.98) prog.v = 1;
          assemble.progress(prog.v);
          count.textContent = String(Math.round(prog.v * 100)).padStart(3, "0");
          if (prog.v < 1) raf = requestAnimationFrame(tick);
          else scatter();
        };
        raf = requestAnimationFrame(tick);
      }, el);
    };

    const replay = () => {
      if (prefersReduced()) {
        skip();
        return;
      }
      getLenis()?.scrollTo(0, { immediate: true, force: true });
      run();
    };

    // Mobile browsers often load a page before it is on screen (prerendered
    // from the address bar, or opened in a background tab). The intro waits
    // until the visitor can actually see it.
    const doc = document as Document & { prerendering?: boolean };
    const hiddenNow = () => doc.prerendering === true || doc.hidden;
    const startWhenSeen = () => {
      if (hiddenNow()) return;
      doc.removeEventListener("prerenderingchange", startWhenSeen);
      doc.removeEventListener("visibilitychange", startWhenSeen);
      run();
    };

    window.addEventListener(REPLAY_EVENT, replay);
    if (html.hasAttribute("data-preload")) {
      (window as unknown as { __ctPre: boolean }).__ctPre = true;
      if (hiddenNow()) {
        doc.addEventListener("prerenderingchange", startWhenSeen);
        doc.addEventListener("visibilitychange", startWhenSeen);
      } else {
        run();
      }
    } else {
      reveal.current();
    }

    return () => {
      doc.removeEventListener("prerenderingchange", startWhenSeen);
      doc.removeEventListener("visibilitychange", startWhenSeen);
      window.removeEventListener(REPLAY_EVENT, replay);
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      ctx?.revert();
      if (html.hasAttribute("data-preload")) {
        pendingUnlock = window.setTimeout(unlock, 0);
      }
    };
  }, []);

  return (
    <div ref={root} className="pre" aria-hidden="true">
      <div className="pre-half pre-top" />
      <div className="pre-half pre-bot" />
      <div className="pre-stage">
        <div className="pre-box">
          <svg className="pre-logo" viewBox="232 748 1100 184">
            <g className="pre-sym" transform={SYM_START}>
              <g className="pre-sym-inner" transform={SYM_FIT}>
                {LOGO_PIECES.map((p, i) => (
                  <path
                    key={i}
                    className="pre-piece"
                    d={p.d}
                    fillOpacity={p.tone}
                    fillRule="evenodd"
                  />
                ))}
              </g>
            </g>
            <g>
              {WORD_LETTERS.map((d, i) => (
                <path
                  key={i}
                  className="pre-letter"
                  d={d}
                  fill="#fff"
                  fillRule="evenodd"
                />
              ))}
            </g>
          </svg>
          <div className="pre-sweep" />
        </div>
      </div>
      <span className="pre-count">000</span>
      <span className="pre-note mono">Assembling</span>
    </div>
  );
}
