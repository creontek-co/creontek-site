"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { MaskHeading } from "@/components/ui/Reveal";
import { gsap, isMobile, prefersReduced } from "@/lib/motion";
import { GROWTH_PROBLEMS } from "@/lib/site";
import { playClick, playRedraw } from "@/lib/sound";

const BOX_W = 176;
const BOX_H = 76;

function wrap(t: string) {
  if (t.length < 17) return [t];
  const mid = t.length / 2;
  let best = -1;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid)))
      best = i;
  }
  return best < 0 ? [t] : [t.slice(0, best), t.slice(best + 1)];
}

function Diagram({
  index,
  vertical,
}: {
  index: number;
  vertical: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const p = GROWTH_PROBLEMS[index];

  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg || prefersReduced()) return;
    const q = gsap.utils.selector(svg);
    const ctx = gsap.context(() => {
      q<SVGGeometryElement>(".dd").forEach((r) => {
        const L = r.getTotalLength();
        r.style.strokeDasharray = `${L}`;
        r.style.strokeDashoffset = `${L}`;
      });
      gsap.to(q(".dd"), {
        strokeDashoffset: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power2.out",
      });
      gsap.fromTo(
        q(".da"),
        {
          scaleX: vertical ? 1 : 0,
          scaleY: vertical ? 0 : 1,
          transformOrigin: "0% 0%",
        },
        { scaleX: 1, scaleY: 1, duration: 0.4, stagger: 0.12, delay: 0.4 },
      );
      gsap.fromTo(
        q(".df"),
        { opacity: 0 },
        { opacity: 1, duration: 0.4, stagger: 0.03, delay: 0.3 },
      );
    }, svg);
    return () => ctx.revert();
  }, [index, vertical]);

  const pos = (k: number) =>
    vertical ? { x: 92, y: 40 + k * 118 } : { x: 14 + k * 225, y: 70 };
  const viewBox = vertical ? "0 0 360 490" : "0 0 900 250";

  return (
    <svg
      ref={ref}
      key={`${index}-${vertical}`}
      viewBox={viewBox}
      role="img"
      aria-label={`${p.title}: ${p.steps.join(", then ")}.`}
    >
      {p.steps.map((s, k) => {
        const { x, y } = pos(k);
        const lines = wrap(s);
        const next = pos(k + 1);
        return (
          <g key={s}>
            <rect className="d-box dd" x={x} y={y} width={BOX_W} height={BOX_H} />
            <text className="d-idx df" x={x + 14} y={y + 22}>
              0{k + 1}
            </text>
            {lines.map((ln, li) => (
              <text
                key={ln}
                className="d-label df"
                x={x + 14}
                y={y + (lines.length > 1 ? 46 : 54) + li * 18}
              >
                {ln}
              </text>
            ))}
            {k < 3 &&
              (vertical ? (
                <>
                  <path className="d-arrow da" fill="none" d={`M${x + BOX_W / 2} ${y + BOX_H + 4} V${next.y - 6}`} />
                  <path className="d-arrow df" fill="none" d={`M${x + BOX_W / 2 - 6} ${next.y - 13} L${x + BOX_W / 2} ${next.y - 6} L${x + BOX_W / 2 + 6} ${next.y - 13}`} />
                </>
              ) : (
                <>
                  <path className="d-arrow da" fill="none" d={`M${x + BOX_W + 4} ${y + BOX_H / 2} H${next.x - 6}`} />
                  <path className="d-arrow df" fill="none" d={`M${next.x - 13} ${y + BOX_H / 2 - 6} L${next.x - 6} ${y + BOX_H / 2} L${next.x - 13} ${y + BOX_H / 2 + 6}`} />
                </>
              ))}
          </g>
        );
      })}
      {!vertical && (
        <>
          <text className="d-idx df" x="14" y="36">INPUT · YOUR BUSINESS</text>
          <text className="d-idx d-idx-blue df" x="886" y="36" textAnchor="end">OUTPUT · GROWTH</text>
        </>
      )}
      {p.loop &&
        (vertical ? (
          <>
            <path className="d-arrow dd" fill="none" d={`M${92 + BOX_W + 6} ${pos(3).y + BOX_H / 2} H${92 + BOX_W + 40} V${pos(0).y + BOX_H / 2} H${92 + BOX_W + 10}`} />
            <path className="d-arrow df" fill="none" d={`M${92 + BOX_W + 18} ${pos(0).y + BOX_H / 2 - 6} L${92 + BOX_W + 10} ${pos(0).y + BOX_H / 2} L${92 + BOX_W + 18} ${pos(0).y + BOX_H / 2 + 6}`} />
            <text className="d-idx d-idx-blue df" x="60" y="255" textAnchor="middle" transform="rotate(-90 60 255)">RE-ENGAGE LOOP</text>
          </>
        ) : (
          <>
            <path className="d-arrow dd" fill="none" d={`M${pos(3).x + BOX_W / 2} ${70 + BOX_H + 6} V${70 + BOX_H + 50} H${pos(0).x + BOX_W / 2} V${70 + BOX_H + 10}`} />
            <path className="d-arrow df" fill="none" d={`M${pos(0).x + BOX_W / 2 - 6} ${70 + BOX_H + 18} L${pos(0).x + BOX_W / 2} ${70 + BOX_H + 10} L${pos(0).x + BOX_W / 2 + 6} ${70 + BOX_H + 18}`} />
            <text className="d-idx d-idx-blue df" x="450" y={70 + BOX_H + 44} textAnchor="middle">RE-ENGAGE LOOP</text>
          </>
        ))}
    </svg>
  );
}

export function ProblemTabs() {
  const [active, setActive] = useState(0);
  const [vertical, setVertical] = useState(false);
  const outcome = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const sync = () => setVertical(isMobile());
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useLayoutEffect(() => {
    if (prefersReduced() || !outcome.current) return;
    gsap.fromTo(
      outcome.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.5, delay: 0.6 },
    );
  }, [active]);

  const select = (i: number) => {
    if (i === active) return;
    setActive(i);
    playClick();
    playRedraw();
  };

  const onKey = (e: React.KeyboardEvent) => {
    const n = GROWTH_PROBLEMS.length;
    const map: Record<string, number> = {
      ArrowRight: (active + 1) % n,
      ArrowDown: (active + 1) % n,
      ArrowLeft: (active - 1 + n) % n,
      ArrowUp: (active - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="problems paper" aria-label="Choose your growth problem">
      <div className="p-head">
        <MaskHeading text="What's your growth problem?" />
        <p>
          Every business leaks in a different place, so no two Growth Engines look
          the same. Pick the one that sounds like yours and watch the system
          redraw.
        </p>
      </div>
      <div
        className="tabs"
        role="tablist"
        aria-label="Growth problems"
        onKeyDown={onKey}
      >
        {GROWTH_PROBLEMS.map((p, i) => (
          <button
            key={p.title}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`problem-tab-${i}`}
            className="tab"
            aria-selected={i === active}
            aria-controls="problem-panel"
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
          >
            <span className="mono">Problem 0{i + 1}</span>
            {p.title}
          </button>
        ))}
      </div>
      <div
        className="diagram"
        role="tabpanel"
        id="problem-panel"
        aria-labelledby={`problem-tab-${active}`}
        tabIndex={0}
      >
        <Diagram key={`${active}-${vertical}`} index={active} vertical={vertical} />
        <div className="outcome">
          <span className="mono">Outcome</span>
          <strong ref={outcome}>{GROWTH_PROBLEMS[active].outcome}</strong>
        </div>
      </div>
    </section>
  );
}
