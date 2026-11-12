"use client";

import { useEffect, useRef } from "react";
import { BookButton } from "@/components/ui/Buttons";
import { Words } from "@/components/ui/Words";
import {
  gsap,
  hasFinePointer,
  isMobile,
  prefersReduced,
  scramble,
  useGSAP,
  useWidthKey,
} from "@/lib/motion";
import {
  playCount,
  playCrosshair,
  playPencil,
  playRuler,
  playSnap,
} from "@/lib/sound";
import { whenStageClear } from "@/lib/stage";

const ANNOTATIONS = [
  { key: "sheet", text: "SHEET 01 / 03" },
  { key: "scale", text: "SCALE 1:1" },
  { key: "drawn", text: "DRAWN BY CREONTEK" },
  { key: "rev", text: "REV 01" },
];

const SVG_NS = "http://www.w3.org/2000/svg";
const ARROW = 7;

function svgLine(parent: SVGElement, cls: string, d: string) {
  const p = document.createElementNS(SVG_NS, "path");
  p.setAttribute("class", cls);
  p.setAttribute("d", d);
  p.setAttribute("pathLength", "1");
  parent.appendChild(p);
  return p;
}

type Measure = {
  W: number;
  H: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  lines: number[];
};

function measure(hero: HTMLElement, h1: HTMLElement): Measure {
  const box = hero.getBoundingClientRect();
  const lines = Array.from(h1.querySelectorAll<HTMLElement>(".dt-line")).map(
    (l) => {
      const r = document.createRange();
      r.selectNodeContents(l);
      return r.getBoundingClientRect();
    },
  );
  const left = Math.min(...lines.map((r) => r.left)) - box.left;
  const right = Math.max(...lines.map((r) => r.right)) - box.left;
  const top = lines[0].top - box.top;
  const bottom = lines[lines.length - 1].bottom - box.top;
  return {
    W: box.width,
    H: box.height,
    left,
    right,
    top,
    bottom,
    lines: lines.map((r) => r.bottom - box.top),
  };
}

export function DraftingTable() {
  const root = useRef<HTMLElement>(null);
  const widthKey = useWidthKey();
  const svg = useRef<SVGSVGElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const wLabel = useRef<HTMLSpanElement>(null);
  const hLabel = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const hero = root.current!;
      const overlay = svg.current!;
      const heading = h1.current!;
      const q = gsap.utils.selector(hero);
      const reduced = prefersReduced();
      const mobile = isMobile();

      overlay.innerHTML = "";
      const m = measure(hero, heading);
      overlay.setAttribute("viewBox", `0 0 ${m.W} ${m.H}`);
      const margin = mobile ? 16 : 40;

      // Construction lines: sheet margins, then a line under each headline row.
      const cons: SVGPathElement[] = [
        svgLine(overlay, "cons", `M0 ${m.top - 22} H${m.W}`),
        svgLine(overlay, "cons", `M${m.left} 0 V${m.H}`),
        svgLine(overlay, "cons", `M${m.W - margin} 0 V${m.H}`),
        svgLine(overlay, "cons", `M0 ${m.H - 74} H${m.W}`),
        ...m.lines.map((y) => svgLine(overlay, "cons", `M0 ${y} H${m.W}`)),
      ];

      // Dimension lines extend outward from their midpoint.
      const dy = m.top - 22;
      const mid = (m.left + m.right) / 2;
      const dimX = Math.min(m.right + 34, m.W - margin - 12);
      const midY = (m.top + m.bottom) / 2;
      const dimW = [
        svgLine(overlay, "dim", `M${mid} ${dy} H${m.left}`),
        svgLine(overlay, "dim", `M${mid} ${dy} H${m.right}`),
      ];
      const dimH = [
        svgLine(overlay, "dim", `M${dimX} ${midY} V${m.top}`),
        svgLine(overlay, "dim", `M${dimX} ${midY} V${m.bottom}`),
      ];
      const arrows = [
        svgLine(
          overlay,
          "dim dim-a",
          `M${m.left + ARROW} ${dy - ARROW / 2} L${m.left} ${dy} L${m.left + ARROW} ${dy + ARROW / 2}`,
        ),
        svgLine(
          overlay,
          "dim dim-a",
          `M${m.right - ARROW} ${dy - ARROW / 2} L${m.right} ${dy} L${m.right - ARROW} ${dy + ARROW / 2}`,
        ),
        svgLine(
          overlay,
          "dim dim-a",
          `M${dimX - ARROW / 2} ${m.top + ARROW} L${dimX} ${m.top} L${dimX + ARROW / 2} ${m.top + ARROW}`,
        ),
        svgLine(
          overlay,
          "dim dim-a",
          `M${dimX - ARROW / 2} ${m.bottom - ARROW} L${dimX} ${m.bottom} L${dimX + ARROW / 2} ${m.bottom - ARROW}`,
        ),
      ];

      const textW = Math.round(m.right - m.left);
      const textH = Math.round(m.bottom - m.top);
      const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
      const wEl = wLabel.current!;
      const hEl = hLabel.current!;
      gsap.set(wEl, { left: mid, top: dy });
      gsap.set(hEl, { left: dimX, top: midY });
      wEl.textContent = `W ${fmt(textW)}`;
      hEl.textContent = `H ${fmt(textH)}`;

      hero.dataset.ready = "1";
      if (reduced) return;

      const annotations = q<HTMLElement>("[data-anno]");
      const allDraw = [...cons, ...dimW, ...dimH];
      gsap.set(allDraw, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(arrows, { opacity: 0 });
      gsap.set([wEl, hEl, ...annotations, ...q(".dt-north")], { opacity: 0 });
      gsap.set(q(".dt-sub, .dt-ctas"), { opacity: 0, y: 14 });
      gsap.set(q(".wi"), { yPercent: 110 });

      const counter = { w: 0, h: 0 };
      const intro = contextSafe!(() => {
        const tl = gsap.timeline();
        playPencil(0.8);
        tl.call(playRuler, [], 0.95).call(playRuler, [], 1.35);
        tl.to(cons, {
          strokeDashoffset: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "power2.inOut",
        })
          .to(
            q(".dt-line .wi"),
            {
              yPercent: 0,
              duration: 0.8,
              ease: "expo.out",
              stagger: 0.09,
            },
            0.45,
          )
          .to(
            [...dimW, ...dimH],
            { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" },
            0.95,
          )
          .to(arrows, { opacity: 1, duration: 0.2 }, 1.35)
          .to([wEl, hEl], { opacity: 1, duration: 0.2 }, 1.0)
          .to(
            counter,
            {
              w: textW,
              h: textH,
              duration: 0.75,
              ease: "power2.out",
              onUpdate: () => {
                playCount();
                wEl.textContent = `W ${fmt(counter.w)}`;
                hEl.textContent = `H ${fmt(counter.h)}`;
              },
            },
            1.0,
          )
          .to(q(".dt-north"), { opacity: 1, duration: 0.4 }, 1.3)
          .add(() => {
            annotations.forEach((el, i) => {
              gsap.delayedCall(i * 0.08, () => {
                gsap.set(el, { opacity: 1 });
                scramble(el, ANNOTATIONS[i].text, 650);
              });
            });
          }, 1.2)
          .to(
            q(".dt-sub"),
            { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
            1.35,
          )
          .to(
            q(".dt-ctas"),
            { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
            1.55,
          );
      });
      const stop = whenStageClear(intro);

      // Leaning in over the table as the hero leaves.
      gsap.to(grid.current, {
        scale: 1.15,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(overlay, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "60% top",
          scrub: true,
        },
      });

      return () => stop();
    },
    { scope: root, dependencies: [widthKey], revertOnUpdate: true },
  );

  // CAD cursor: full-length crosshair and a live coordinate readout.
  useEffect(() => {
    const hero = root.current;
    if (!hero || !hasFinePointer() || isMobile() || prefersReduced()) return;
    const q = gsap.utils.selector(hero);
    const lineX = q<HTMLElement>(".cad-x")[0];
    const lineY = q<HTMLElement>(".cad-y")[0];
    const readout = q<HTMLElement>(".cad-readout")[0];
    const pad = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, "0");

    let cell = "";
    let wasTarget = false;
    const move = (e: PointerEvent) => {
      const box = hero.getBoundingClientRect();
      let x = e.clientX - box.left;
      let y = e.clientY - box.top;
      // A tiny click each time the crosshair crosses a major grid line.
      const next = `${Math.floor(x / 120)}:${Math.floor(y / 120)}`;
      if (next !== cell) {
        cell = next;
        playCrosshair();
      }
      const target = (e.target as Element).closest?.("a,button");
      let text = `X ${pad(x)} · Y ${pad(y)}`;
      if (target) {
        // Snap to the nearest vertical and horizontal edge of the element.
        const r = target.getBoundingClientRect();
        const l = r.left - box.left;
        const t = r.top - box.top;
        x = x - l < r.width / 2 ? l : l + r.width;
        y = y - t < r.height / 2 ? t : t + r.height;
        text = "SELECT";
      }
      if (!!target !== wasTarget) {
        wasTarget = !!target;
        if (target) playSnap();
      }
      gsap.set(lineX, { y });
      gsap.set(lineY, { x });
      gsap.set(readout, { x: x + 12, y: y + 12 });
      readout.textContent = text;
      hero.dataset.cad = "1";
    };
    const leave = () => {
      hero.dataset.cad = "";
    };
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);
    return () => {
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <section ref={root} className="dt-hero" data-cursor-none="">
      <div ref={grid} className="dt-grid paper" aria-hidden="true" />
      <svg ref={svg} className="dt-overlay" aria-hidden="true" />
      <span ref={wLabel} className="dt-dim-label mono" aria-hidden="true">
        W 0
      </span>
      <span ref={hLabel} className="dt-dim-label mono" aria-hidden="true">
        H 0
      </span>

      <div className="dt-annos mono" aria-hidden="true">
        {ANNOTATIONS.map((a) => (
          <span key={a.key} data-anno="">
            {a.text}
          </span>
        ))}
        <svg className="dt-north" viewBox="0 0 40 52" fill="none">
          <circle cx="20" cy="30" r="16" stroke="currentColor" />
          <path d="M20 8 L26 36 L20 31 L14 36 Z" fill="currentColor" />
          <text x="20" y="6" textAnchor="middle" fontSize="8" fill="currentColor">
            N
          </text>
        </svg>
      </div>

      <div className="dt-content">
        <h1 ref={h1} className="dt-title" data-intro="">
          <span className="dt-line">
            <Words text="We architect" />
          </span>{" "}
          <span className="dt-line">
            <Words text="growth systems." />
          </span>
        </h1>
        <p className="dt-sub">
          AI-powered systems that help businesses attract more customers, convert
          more opportunities and grow revenue. Every business has a different
          growth problem, so every system starts with a blueprint.
        </p>
        <div className="dt-ctas">
          <BookButton />
          <a className="pill" href="#blueprint">
            See how it works ↓
          </a>
        </div>
      </div>

      <div className="cad" aria-hidden="true">
        <i className="cad-x" />
        <i className="cad-y" />
        <span className="cad-readout mono" />
      </div>
    </section>
  );
}
