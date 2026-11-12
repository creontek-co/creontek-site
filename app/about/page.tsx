import type { Metadata } from "next";
import Link from "next/link";
import { BookButton } from "@/components/ui/Buttons";
import {
  Brighten,
  MaskHeading,
  ScrambleText,
  Shutter,
} from "@/components/ui/Reveal";
import { HOW_WE_WORK } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "CreonTek builds technology that moves businesses forward, through Studio and Growth Engine.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <div className="about-hero">
        <ScrambleText className="mono page-eyebrow" text="Est. 2026 · Lagos / London / New York / Dubai / Amsterdam" />
        <MaskHeading as="h1" text="We build technology that moves businesses forward." />
        <Brighten
          className="about-statement"
          text="Most businesses don't need more technology. They need technology that works as hard as they do."
        />
      </div>
      <Shutter />
      <div className="page paper about-body">
        <section aria-labelledby="about-offers">
          <MaskHeading id="about-offers" text="Two offers. One standard." />
          <div className="about-offers">
            <Link href="/studio" className="about-offer">
              <span className="mono">Studio</span>
              <h3>Premium digital experiences, engineered for business.</h3>
              <p>
                Premium websites, web applications and e-commerce that communicate
                a brand&apos;s value, elevate its perception and turn visitors into
                customers.
              </p>
            </Link>
            <Link href="/growth-engine" className="about-offer">
              <span className="mono">Growth Engine</span>
              <h3>AI growth systems that attract, convert and grow.</h3>
              <p>
                We don&apos;t sell individual AI tools. We build interconnected
                systems that help businesses grow.
              </p>
            </Link>
          </div>
        </section>

        <section aria-labelledby="about-how">
          <MaskHeading id="about-how" text="How we work" />
          <ol className="about-steps">
            {HOW_WE_WORK.map((s, i) => (
              <li key={s.title}>
                <span className="mono">0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.line}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="about-cta">
          <MaskHeading text="Ready to build what's next?" />
          <BookButton />
        </div>
      </div>
    </>
  );
}
