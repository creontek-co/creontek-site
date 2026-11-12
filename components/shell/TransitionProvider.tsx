"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { gsap, isMobile, prefersReduced } from "@/lib/motion";
import { playDoor, playDoorBack } from "@/lib/sound";
import { holdStage, releaseStage } from "@/lib/stage";

type EnterArgs = {
  href: "/studio" | "/growth-engine";
  card: HTMLElement;
  visual: HTMLElement;
  other?: HTMLElement | null;
};

type Ctx = { enter: (args: EnterArgs) => void };
const TransitionContext = createContext<Ctx>({ enter: () => {} });
export const useDoorTransition = () => useContext(TransitionContext);

const READY_TIMEOUT = 6000;

function makeHalf(visual: HTMLElement, side: "left" | "right") {
  const half = document.createElement("div");
  half.className = `dt-half dt-${side}`;
  const clone = visual.cloneNode(true) as HTMLElement;
  clone.classList.add("dt-visual");
  half.appendChild(clone);

  // Keep both halves in sync with the card's video, mid-loop.
  const src = visual.querySelector("video");
  const video = clone.querySelector("video");
  if (src && video) {
    video.muted = true;
    video.currentTime = src.currentTime;
    video.play().catch(() => {});
  }
  const shade = document.createElement("div");
  shade.className = "dt-shade";
  half.appendChild(shade);
  return half;
}

/**
 * The persistent door transition. No door is ever drawn: the clicked card
 * expands to fill the viewport, then its visual splits into two halves that
 * swing open onto the destination's background colour.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    router.prefetch("/studio");
    router.prefetch("/growth-engine");
  }, [router]);

  // Going back through a door plays the quick reverse sound.
  const previous = useRef(pathname);
  useEffect(() => {
    const onDoor = (p: string) => p === "/studio" || p === "/growth-engine";
    if (pathname === "/" && onDoor(previous.current)) playDoorBack();
    previous.current = pathname;
  }, [pathname]);

  const finish = useCallback(
    (cleanup: () => void) => {
      let released = false;
      const release = () => {
        if (released) return;
        released = true;
        clearTimeout(timer);
        cleanup();
        releaseStage();
      };
      const timer = setTimeout(release, READY_TIMEOUT);
      // The signal arrives from inside the destination hero's GSAP context.
      // Releasing there would make the overlay's fade part of that context,
      // and the fade would die with it whenever the hero's effect re-runs,
      // leaving the overlay stuck over the page. So always leave that stack.
      holdStage(() => setTimeout(release, 0));
    },
    [],
  );

  const enter = useCallback(
    ({ href, card, visual, other }: EnterArgs) => {
      const root = overlay.current;
      const behind = page.current;
      if (!root || !behind || busy.current) return;
      busy.current = true;

      const dest = href === "/studio" ? "gallery" : "paper";
      root.className = "dt";
      root.innerHTML = "";
      const stage = document.createElement("div");
      stage.className = "dt-stage";
      const backdrop = document.createElement("div");
      backdrop.className = `dt-dest ${dest === "paper" ? "paper" : "gallery-bg"}`;
      stage.appendChild(backdrop);
      root.appendChild(stage);
      root.hidden = false;

      const fadeOut = (onDone?: () => void) =>
        gsap.to(root, {
          opacity: 0,
          duration: 0.35,
          ease: "power1.out",
          onComplete: () => {
            root.hidden = true;
            root.innerHTML = "";
            gsap.set(root, { clearProps: "opacity" });
            busy.current = false;
            onDone?.();
          },
        });

      // Reduced motion: a simple 300ms crossfade.
      if (prefersReduced()) {
        gsap.fromTo(
          root,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.3,
            onComplete: () => {
              router.push(href);
              finish(() => fadeOut());
            },
          },
        );
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = isMobile();
      const rect = card.getBoundingClientRect();

      const inner = document.createElement("div");
      inner.className = "dt-inner";
      inner.style.perspective = `${Math.max(1400, vw * 1.15)}px`;
      const left = makeHalf(visual, "left");
      const right = makeHalf(visual, "right");
      const seam = document.createElement("div");
      seam.className = "dt-seam";
      inner.append(left, right, seam);
      stage.appendChild(inner);

      const startScale = Math.max(rect.width / vw, rect.height / vh);
      const inset = {
        t: rect.top,
        r: vw - rect.right,
        b: vh - rect.bottom,
        l: rect.left,
        round: 6,
      };
      const applyClip = () => {
        stage.style.clipPath = `inset(${inset.t}px ${inset.r}px ${inset.b}px ${inset.l}px round ${inset.round}px)`;
      };
      applyClip();

      const originY = window.scrollY + vh / 2;
      gsap.set(behind, { transformOrigin: `50% ${originY}px` });

      playDoor();

      const tl = gsap.timeline({
        onComplete: () => {
          // The overlay is opaque now. Clear the camera move first, so the
          // destination hero measures itself at true size when it mounts.
          gsap.set(behind, {
            clearProps: "transform,filter,visibility,transformOrigin",
          });
          gsap.set(card, { clearProps: "all" });
          if (other) gsap.set(other, { clearProps: "all" });
          router.push(href);
          finish(() => fadeOut());
        },
      });

      // 0 to 0.15s: the card lifts, the other fades, and the card fills the screen.
      tl.to(card, { scale: 1.02, duration: 0.15, ease: "power2.out" }, 0);
      if (other) tl.to(other, { opacity: 0, duration: 0.15 }, 0);
      tl.to(
        inset,
        {
          t: 0,
          r: 0,
          b: 0,
          l: 0,
          round: 0,
          duration: 0.5,
          ease: "expo.inOut",
          onUpdate: applyClip,
        },
        0.05,
      );
      tl.fromTo(
        inner,
        {
          x: rect.left + rect.width / 2 - vw / 2,
          y: rect.top + rect.height / 2 - vh / 2,
          scale: startScale,
        },
        { x: 0, y: 0, scale: 1, duration: 0.5, ease: "expo.inOut" },
        0.05,
      );

      // 0.15 to 0.9s: a light seam, then the halves swing like a double door.
      tl.fromTo(seam, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.42);
      tl.to(seam, { opacity: 0, duration: 0.15 }, 0.6);
      tl.to(left, { rotateY: -105, duration: 0.75, ease: "expo.inOut" }, 0.15);
      tl.to(right, { rotateY: 105, duration: 0.75, ease: "expo.inOut" }, 0.15);
      tl.to(
        [left.lastElementChild, right.lastElementChild],
        { opacity: 1, duration: 0.5, ease: "power1.in" },
        0.3,
      );
      tl.to([left, right], { opacity: 0, duration: 0.2 }, 0.78);

      // 0.3 to 1.2s: the camera moves in through the opening.
      tl.to(
        behind,
        {
          scale: 1.35,
          ...(mobile ? {} : { filter: "blur(6px)" }),
          duration: 0.9,
          ease: "power2.in",
        },
        0.3,
      );
      // Once the card covers the screen the page needs no more painting.
      tl.set(behind, { visibility: "hidden" }, 0.62);
      tl.to({}, { duration: 0.01 }, 1.19);

      // On phones the sequence runs in about 0.9s.
      if (mobile) tl.timeScale(1.4 / 0.9);
    },
    [finish, router],
  );

  const value = useMemo(() => ({ enter }), [enter]);

  return (
    <TransitionContext.Provider value={value}>
      <div ref={page} className="page-root">
        {children}
      </div>
      <div ref={overlay} className="dt" hidden aria-hidden="true" />
    </TransitionContext.Provider>
  );
}
