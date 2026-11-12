"use client";

import { useRef } from "react";
import { useCursorImage } from "@/components/ui/CursorImage";
import { scramble } from "@/lib/motion";
import { STUDIO_SERVICES } from "@/lib/site";

export function Services() {
  const { listRef, show, node } = useCursorImage();
  const nums = useRef<(HTMLSpanElement | null)[]>([]);

  return (
    <section className="s-services" aria-label="Services">
      <ul ref={listRef as React.RefObject<HTMLUListElement>}>
        {STUDIO_SERVICES.map((s, i) => (
          <li
            key={s.title}
            className="s-service"
            onPointerEnter={() => {
              show(s.image);
              scramble(nums.current[i], `0${i + 1}`, 500);
            }}
          >
            <span
              ref={(el) => {
                nums.current[i] = el;
              }}
              className="s-num"
            >
              0{i + 1}
            </span>
            <h2>{s.title}</h2>
            <p>{s.line}</p>
          </li>
        ))}
      </ul>
      {node}
    </section>
  );
}
