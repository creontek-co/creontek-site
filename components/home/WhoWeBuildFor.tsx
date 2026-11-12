"use client";

import { useState } from "react";
import { useCursorImage } from "@/components/ui/CursorImage";
import { MaskHeading } from "@/components/ui/Reveal";
import { INDUSTRIES } from "@/lib/site";

export function WhoWeBuildFor() {
  const { listRef, show, node } = useCursorImage();
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="who" aria-labelledby="who-title">
      <MaskHeading id="who-title" className="who-title" text="Who we build for" />
      <ul
        ref={listRef as React.RefObject<HTMLUListElement>}
        className="who-list"
        onPointerLeave={() => setActive(null)}
      >
        {INDUSTRIES.map((row, i) => (
          <li
            key={row.name}
            className="who-row"
            data-active={active === i ? "1" : ""}
            onPointerEnter={() => {
              setActive(i);
              show(row.image);
            }}
          >
            <span className="mono who-num">0{i + 1}</span>
            <span className="who-name">
              <span className="who-base">{row.name}</span>
              <span className="who-lit" aria-hidden="true">
                {row.name}
              </span>
            </span>
            <span className="who-line">{row.line}</span>
          </li>
        ))}
      </ul>
      {node}
    </section>
  );
}
