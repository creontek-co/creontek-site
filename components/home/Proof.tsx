"use client";

import { useEffect, useState } from "react";
import { Shutter } from "@/components/ui/Reveal";
import { prefersReduced } from "@/lib/motion";
import type { Testimonial } from "@/lib/site";

const HOLD_MS = 6000;

/** Crossfading client quotes. Only rendered when real testimonials exist. */
export function Proof({ items }: { items: Testimonial[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (prefersReduced() || items.length < 2) return;
    const id = setInterval(
      () => setActive((a) => (a + 1) % items.length),
      HOLD_MS,
    );
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <>
      <Shutter />
      <section className="proof paper" aria-label="Client testimonials">
        {items.map((t, i) => (
          <figure key={t.name} className="proof-item" data-active={i === active ? "1" : ""}>
            <blockquote>{t.quote}</blockquote>
            <figcaption className="mono">
              {t.name} · {t.company} · {t.project}
            </figcaption>
          </figure>
        ))}
      </section>
    </>
  );
}
