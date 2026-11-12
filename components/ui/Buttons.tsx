"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, hasFinePointer, isMobile, prefersReduced } from "@/lib/motion";
import { BOOKING_URL } from "@/lib/site";
import { useContact } from "@/components/shell/ContactProvider";

const MAX_PULL = 12;

function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || isMobile() || prefersReduced()) return;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      x(gsap.utils.clamp(-1, 1, dx) * MAX_PULL);
      y(gsap.utils.clamp(-1, 1, dy) * MAX_PULL);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.set(el, { clearProps: "transform" });
    };
  }, []);
  return ref;
}

function Arrow() {
  return (
    <svg
      className="btn-arrow"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M2 8h12M9 3l5 5-5 5" />
    </svg>
  );
}

/** The primary CTA: blue fill, arrow, magnetic. */
export function BookButton({
  children = "Book a strategy call",
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const ref = useMagnetic<HTMLAnchorElement>();
  return (
    <a
      ref={ref}
      className={`btn ${className}`}
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <Arrow />
    </a>
  );
}

export function Pill({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link className={`pill ${className}`} href={href}>
      {children}
    </Link>
  );
}

/** Opens the enquiry modal. */
export function EnquiryLink({
  children = "Send an enquiry",
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { open } = useContact();
  return (
    <a
      className={`text-link ${className}`}
      href="/contact"
      onClick={(e) => {
        e.preventDefault();
        open();
      }}
    >
      {children}
    </a>
  );
}
