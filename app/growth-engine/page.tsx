import type { Metadata } from "next";
import { shareMeta } from "@/lib/seo";
import { Blueprint } from "@/components/growth/Blueprint";
import { DraftingTable } from "@/components/growth/DraftingTable";
import { ProblemTabs } from "@/components/growth/ProblemTabs";
import { BookButton } from "@/components/ui/Buttons";
import { MaskHeading, ScrambleText } from "@/components/ui/Reveal";
import { GROWTH_INCLUDED, PAGE_META } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: PAGE_META.growth.title },
  description: PAGE_META.growth.description,
  alternates: { canonical: "/growth-engine" },
  ...shareMeta({
    title: PAGE_META.growth.title,
    description: PAGE_META.growth.description,
    path: "/growth-engine",
  }),
};

export default function GrowthEnginePage() {
  return (
    <div className="ge-page">
      <DraftingTable />
      <Blueprint />
      <ProblemTabs />

      <section className="spec paper" aria-labelledby="spec-title">
        <div className="spec-head">
          <ScrambleText as="span" className="mono spec-eyebrow" text="Schedule of works" />
          <MaskHeading id="spec-title" text="What's included" />
        </div>
        <div className="spec-scroll">
          <table className="spec-table">
            <thead>
              <tr>
                <th scope="col">Ref</th>
                <th scope="col">Item</th>
                <th scope="col">Scope</th>
                <th scope="col">Phase</th>
              </tr>
            </thead>
            <tbody>
              {GROWTH_INCLUDED.map((row, i) => (
                <tr key={row.item}>
                  <td className="mono">A{i + 1}</td>
                  <th scope="row">{row.item}</th>
                  <td>{row.scope}</td>
                  <td className="mono">{row.phase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="spec-prices">
          <p>
            <span className="mono">Starting point</span>
            Implementation from $2,499
          </p>
          <p>
            <span className="mono">Starting point</span>
            Management from $799/month
          </p>
        </div>
      </section>

      <section className="tb-wrap paper" aria-label="Start your project">
        <div className="tblock">
          <div className="cell">
            <span className="mono">Project</span>
            <b>Your growth system</b>
          </div>
          <div className="cell">
            <span className="mono">Drawn by</span>
            <b>CreonTek</b>
          </div>
          <div className="cell">
            <span className="mono">Scale</span>
            <b>Built to scale</b>
          </div>
          <div className="cell">
            <span className="mono">Revision</span>
            <b>01</b>
          </div>
          <div className="cell cta-cell">
            <MaskHeading as="h2" text="Commission your blueprint." />
            <BookButton />
          </div>
        </div>
      </section>
    </div>
  );
}
