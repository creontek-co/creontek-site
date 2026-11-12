"use client";

import { useRef } from "react";
import {
  clamp01,
  gsap,
  isMobile,
  maskIn,
  prefersReduced,
  scramble,
  useGSAP,
  useWidthKey,
  wordsHtml,
} from "@/lib/motion";
import { BLUEPRINT_STAGES } from "@/lib/site";
import { playStage } from "@/lib/sound";

const BLUE = "#2F5BFF";
const RAIL = ["Plan", "Diagnose", "Engineer", "Build"];

export function Blueprint() {
  const root = useRef<HTMLElement>(null);
  const widthKey = useWidthKey();
  const plan = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const head = useRef<HTMLHeadingElement>(null);
  const body = useRef<HTMLParagraphElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReduced()) return;
      const q = gsap.utils.selector(svg);
      const mobile = isMobile();
      const planEl = plan.current!;
      const svgEl = svg.current!;
      const railSpans = Array.from(rail.current!.children) as HTMLElement[];

      // Stacked clones of the walls extrude the plan in the isometric view.
      const layers: SVGSVGElement[] = [];
      if (!mobile) {
        const walls = svgEl.querySelector("[data-walls]")!;
        for (let i = 1; i <= 6; i++) {
          const s = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg",
          );
          s.setAttribute("viewBox", "0 0 960 560");
          s.setAttribute("class", "plan-layer");
          s.setAttribute("aria-hidden", "true");
          s.appendChild(walls.cloneNode(true));
          s.style.transform = `translateZ(${i * 7}px)`;
          planEl.appendChild(s);
          layers.push(s);
        }
      }

      q<SVGGeometryElement>(".draw").forEach((p) => {
        const L = p.getTotalLength();
        p.style.strokeDasharray = `${L}`;
        p.style.strokeDashoffset = `${L}`;
      });
      gsap.set(q(".fade, .pop, .plan-door"), { opacity: 0 });
      gsap.set(q(".pop"), { scale: 0.4, transformOrigin: "50% 50%" });
      q<SVGElement>(".grow").forEach((p) =>
        gsap.set(p, {
          scaleX: 0,
          transformOrigin:
            p.dataset.o === "left" ? "0% 50%" : "100% 50%",
          smoothOrigin: false,
        }),
      );
      gsap.set(q(".sealx"), { scaleY: 0, transformOrigin: "50% 50%" });

      let current = 0;
      const setStage = (i: number) => {
        if (i === current) return;
        current = i;
        const s = BLUEPRINT_STAGES[i];
        scramble(label.current, s.label, 600);
        if (head.current) {
          head.current.innerHTML = wordsHtml(s.head);
          maskIn(head.current);
        }
        if (body.current) {
          body.current.textContent = s.body;
          gsap.fromTo(
            body.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          );
        }
        playStage(i);
      };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          // The first walls start drawing as the hero leaves.
          start: "top 55%",
          end: "bottom bottom",
          scrub: 0.7,
          onUpdate: (self) => {
            const t = self.progress * tl.duration();
            const L = tl.labels;
            const marks = [L.plan, L.diag, L.eng, L.built];
            setStage(
              t < L.stage1
                ? 0
                : t < marks[1]
                  ? 1
                  : t < marks[2]
                    ? 2
                    : t < marks[3]
                      ? 3
                      : 4,
            );
            const ends = [L.diag, L.eng, L.built, tl.duration() - 0.8];
            railSpans.forEach((s, i) =>
              s.style.setProperty(
                "--f",
                String(clamp01((t - marks[i]) / (ends[i] - marks[i]))),
              ),
            );
          },
        },
      });

      tl.addLabel("plan", 0.5)
        .addLabel("stage1", 1.1)
        .to(
          q("[data-walls] .draw"),
          { strokeDashoffset: 0, duration: 1.4, stagger: 0.25 },
          "plan",
        )
        .to(
          q("[data-dims] .draw"),
          { strokeDashoffset: 0, duration: 1, stagger: 0.15 },
          "plan+=.4",
        )
        .to(q("[data-dims] .fade"), { opacity: 1, duration: 0.5, stagger: 0.1 }, "plan+=1")
        .to(
          q("[data-doors] .draw"),
          { strokeDashoffset: 0, duration: 0.5, stagger: 0.1 },
          "plan+=1.3",
        )
        .to(q("[data-doors] .plan-door"), { opacity: 1, duration: 0.4, stagger: 0.1 }, "plan+=1.5")
        .to(q("[data-rooms] .fade"), { opacity: 1, duration: 0.6, stagger: 0.2 }, "plan+=1.4")
        .addLabel("diag", "+=.3")
        .to(q("[data-leaks] .grow"), { scaleX: 1, duration: 0.9, stagger: 0.25 }, "diag")
        .to(
          q("[data-leaks] .draw"),
          { strokeDashoffset: 0, duration: 0.6, stagger: 0.12 },
          "diag+=.5",
        )
        .to(q("[data-leaks] .fade"), { opacity: 1, duration: 0.4, stagger: 0.08 }, "diag+=.8")
        .addLabel("eng", "+=.3")
        .to(q("[data-leaks] .lk"), { opacity: 0.16, duration: 0.6 }, "eng")
        .to(q("[data-system] .sealx"), { scaleY: 1, duration: 0.4, stagger: 0.1 }, "eng")
        .to(
          q("[data-system] .pop"),
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.12, ease: "back.out(2)" },
          "eng+=.3",
        )
        .to(
          q("[data-system] .draw"),
          { strokeDashoffset: 0, duration: 1.2, stagger: 0.12 },
          "eng+=.4",
        )
        .to(q("[data-system] .fade"), { opacity: 1, duration: 0.4 }, "eng+=1.6")
        .addLabel("built", "+=.3")
        .to(q("[data-dims], [data-leaks]"), { opacity: 0, duration: 0.5 }, "built");

      if (mobile) {
        // Phones skip the extrusion and settle on the final plan.
        tl.to({}, { duration: 1.6 });
      } else {
        tl.to(
          planEl,
          {
            rotateX: 56,
            rotateZ: -38,
            scale: 0.8,
            y: -10,
            duration: 1.6,
            ease: "power2.inOut",
          },
          "built",
        )
          .to(
            layers,
            {
              opacity: (i: number) => 0.55 - i * 0.07,
              duration: 0.8,
              stagger: 0.05,
            },
            "built+=.8",
          )
          .to({}, { duration: 0.8 });
      }

      return () => layers.forEach((l) => l.remove());
    },
    { scope: root, dependencies: [widthKey], revertOnUpdate: true },
  );

  const first = BLUEPRINT_STAGES[0];

  return (
    <section ref={root} id="blueprint" className="bp paper" aria-label="The growth blueprint">
      <div className="bp-sticky">
        <div className="bp-text">
          <div className="bp-live" aria-live="polite">
            <span ref={label} className="stage-label mono">
              {first.label}
            </span>
            <h2
              ref={head}
              dangerouslySetInnerHTML={{ __html: wordsHtml(first.head) }}
            />
            <p ref={body}>{first.body}</p>
          </div>
          {/* The full story, shown when reduced motion stops the scroll drawing. */}
          <ol className="bp-all">
            {BLUEPRINT_STAGES.map((s) => (
              <li key={s.label}>
                <span className="stage-label mono">{s.label}</span>
                <h2>{s.head}</h2>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="rail-wrap">
            <div ref={rail} className="rail">
              {RAIL.map((r) => (
                <span key={r} />
              ))}
            </div>
            <div className="rail-labels mono">
              {RAIL.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="stage-wrap">
          <div ref={plan} className="plan">
            <svg
              ref={svg}
              viewBox="0 0 960 560"
              role="img"
              aria-label="Floor plan of a business with four rooms: Attract, Convert, Follow up and Operate. Leaks show where customers are lost; a blue system connects every room."
            >
              <g data-dims="">
                <path className="thin draw" d="M160 40 H800" />
                <path className="thin draw" d="M160 33 V47 M480 33 V47 M800 33 V47" />
                <text className="t-dim fade" x="320" y="26" textAnchor="middle">DEMAND</text>
                <text className="t-dim fade" x="640" y="26" textAnchor="middle">REVENUE</text>
                <path className="thin draw" d="M136 70 V490" />
                <path className="thin draw" d="M129 70 H143 M129 280 H143 M129 490 H143" />
                <text className="t-dim fade" x="122" y="175" textAnchor="middle" transform="rotate(-90 122 175)">FRONT</text>
                <text className="t-dim fade" x="122" y="385" textAnchor="middle" transform="rotate(-90 122 385)">BACK</text>
              </g>
              <g data-walls="">
                <path className="wall draw" d="M160 70 H800 V490 H160 Z" />
                <path className="wall draw wall-inner" d="M170 80 H790 V480 H170 Z" />
                <path className="wall draw" d="M480 80 V190 M480 236 V330 M480 376 V480" />
                <path className="wall draw" d="M170 280 H270 M316 280 H644 M690 280 H790" />
              </g>
              <g data-doors="">
                <path className="thin draw" d="M480 236 H526" />
                <path className="plan-door" d="M526 236 A46 46 0 0 0 480 190" />
                <path className="thin draw" d="M316 280 V326" />
                <path className="plan-door" d="M316 326 A46 46 0 0 1 270 280" />
                <path className="thin draw" d="M480 376 H434" />
                <path className="plan-door" d="M434 376 A46 46 0 0 1 480 330" />
                <path className="thin draw" d="M644 280 V234" />
                <path className="plan-door" d="M644 234 A46 46 0 0 1 690 280" />
              </g>
              <g data-rooms="">
                <g className="fade"><text className="t-num" x="200" y="112">01</text><text className="t-room" x="200" y="134">ATTRACT</text><text className="t-desc" x="200" y="154">Where customers find you</text></g>
                <g className="fade"><text className="t-num" x="520" y="112">02</text><text className="t-room" x="520" y="134">CONVERT</text><text className="t-desc" x="520" y="154">Where enquiries become clients</text></g>
                <g className="fade"><text className="t-num" x="200" y="420">03</text><text className="t-room" x="200" y="442">FOLLOW UP</text><text className="t-desc" x="200" y="462">Where nobody gets forgotten</text></g>
                <g className="fade"><text className="t-num" x="520" y="420">04</text><text className="t-room" x="520" y="442">OPERATE</text><text className="t-desc" x="520" y="462">Where the work gets done</text></g>
              </g>
              <g data-leaks="">
                <g className="lk"><path className="leak grow" data-o="right" d="M300 200 H22" /><path className="ring draw" d="M30 194 L20 200 L30 206" /><circle className="ring draw" cx="165" cy="200" r="17" /><text className="t-leak fade" x="22" y="222">DEMAND LEFT</text><text className="t-leak fade" x="22" y="236">UNTAPPED</text></g>
                <g className="lk"><path className="leak grow" data-o="left" d="M660 200 H938" /><path className="ring draw" d="M930 194 L940 200 L930 206" /><circle className="ring draw" cx="795" cy="200" r="17" /><text className="t-leak fade" x="938" y="222" textAnchor="end">ENQUIRIES</text><text className="t-leak fade" x="938" y="236" textAnchor="end">LEFT WAITING</text></g>
                <g className="lk"><path className="leak grow" data-o="right" d="M300 362 H22" /><path className="ring draw" d="M30 356 L20 362 L30 368" /><circle className="ring draw" cx="165" cy="362" r="17" /><text className="t-leak fade" x="22" y="384">QUOTES NEVER</text><text className="t-leak fade" x="22" y="398">CHASED</text></g>
                <g className="lk"><path className="leak grow" data-o="left" d="M660 362 H938" /><path className="ring draw" d="M930 356 L940 362 L930 368" /><circle className="ring draw" cx="795" cy="362" r="17" /><text className="t-leak fade" x="938" y="384" textAnchor="end">HOURS LOST</text><text className="t-leak fade" x="938" y="398" textAnchor="end">TO ADMIN</text></g>
              </g>
              <g data-system="">
                <line className="seal sealx" x1="165" y1="186" x2="165" y2="214" />
                <line className="seal sealx" x1="795" y1="186" x2="795" y2="214" />
                <line className="seal sealx" x1="165" y1="348" x2="165" y2="376" />
                <line className="seal sealx" x1="795" y1="348" x2="795" y2="376" />
                <path className="sys draw" d="M454 280 H400 V214 H332" />
                <path className="sys draw" d="M506 280 H560 V214 H632" />
                <path className="sys draw" d="M454 280 H400 V346 H332" />
                <path className="sys draw" d="M506 280 H560 V346 H632" />
                <path className="sys draw" d="M318 340 H226 V220 H318" />
                <path className="sys-thin draw" d="M232 236 L226 226 L220 236" />
                <g className="pop"><rect x="318" y="207" width="14" height="14" fill={BLUE} /><text className="t-node" x="344" y="245">AI OUTREACH</text></g>
                <g className="pop"><rect x="632" y="207" width="14" height="14" fill={BLUE} /><text className="t-node" x="600" y="245">AI QUALIFY + BOOK</text></g>
                <g className="pop"><rect x="318" y="339" width="14" height="14" fill={BLUE} /><text className="t-node" x="340" y="330">SEQUENCES</text></g>
                <g className="pop"><rect x="632" y="339" width="14" height="14" fill={BLUE} /><text className="t-node" x="580" y="330">AUTOMATION + CRM</text></g>
                <g className="pop"><circle cx="480" cy="280" r="27" fill={BLUE} /><text className="t-core" x="480" y="277" textAnchor="middle">GROWTH</text><text className="t-core" x="480" y="289" textAnchor="middle">ENGINE</text></g>
                <circle className="sys-thin draw" cx="639" cy="214" r="30" />
                <path className="sys-thin draw" d="M667 203 L846 156" />
                <g className="fade"><rect x="846" y="128" width="112" height="56" fill="#EEECE7" stroke={BLUE} /><text className="t-detail" x="854" y="146">DETAIL A</text><text className="t-detail" x="854" y="161">LEAD SCORING</text><text className="t-detail" x="854" y="175">ROUTE · BOOK</text></g>
              </g>
            </svg>
          </div>
        </div>
        <span className="title-mark mono">Sheet 02 · Growth plan · Rev 01</span>
      </div>
    </section>
  );
}
