"use client";

import {
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import {
  gsap,
  maskIn,
  prefersReduced,
  scramble,
  useGSAP,
} from "@/lib/motion";
import { Words } from "./Words";

function useOnView(
  ref: React.RefObject<HTMLElement | null>,
  fn: (el: HTMLElement) => void,
  threshold = 0.2,
) {
  const cb = useRef(fn);
  useEffect(() => {
    cb.current = fn;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        cb.current(el);
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
}

type MaskProps = {
  as?: ElementType;
  text: string;
  className?: string;
  id?: string;
};

/** Headline with the site-wide word-by-word mask reveal. */
export function MaskHeading({ as = "h2", text, className, id }: MaskProps) {
  const ref = useRef<HTMLElement>(null);
  useOnView(ref, (el) => {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    if (!prefersReduced()) maskIn(el);
  });
  const Tag = as;
  return (
    <Tag ref={ref} className={className} id={id} data-mask="">
      <Words text={text} />
    </Tag>
  );
}

/** Mono label that scramble-decodes when it enters the viewport. */
export function ScrambleText({
  as = "span",
  text,
  className,
  duration = 900,
}: {
  as?: ElementType;
  text: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useOnView(ref, (el) => scramble(el, text, duration), 0.5);
  const Tag = as;
  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}

/** Statement that brightens word by word as it scrolls through the viewport. */
export function Brighten({
  text,
  className,
  as = "p",
}: {
  text: string;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (prefersReduced() || !ref.current) return;
      const words = ref.current.querySelectorAll(".bw");
      gsap.fromTo(
        words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            end: "bottom 45%",
            scrub: 0.4,
          },
        },
      );
    },
    { scope: ref },
  );
  const Tag = as;
  return (
    <Tag ref={ref} className={className}>
      {text.split(" ").map((w, i, all) => (
        <span key={i}>
          <span className="bw">{w}</span>
          {i < all.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}

/** Fades content up once when it scrolls into view. */
export function FadeUp({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useOnView(ref, (el) => {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    if (prefersReduced()) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", clearProps: "all" },
    );
  }, 0.1);
  return (
    <div ref={ref} className={className} data-fade="">
      {children}
    </div>
  );
}

/** The dark-to-light wipe: 8 paper bars scrubbed open with scroll. */
export function Shutter() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReduced() || !ref.current) return;
      gsap.to(ref.current.children, {
        scaleY: 1,
        ease: "none",
        stagger: 0.08,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          end: "bottom 40%",
          scrub: 0.6,
        },
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="shutter" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

