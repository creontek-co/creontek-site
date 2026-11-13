import type { Metadata } from "next";
import { shareMeta } from "@/lib/seo";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { MaskHeading, ScrambleText } from "@/components/ui/Reveal";
import { PROJECTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected work and explorations from CreonTek Studio and Growth Engine.",
  alternates: { canonical: "/work" },
  ...shareMeta({
    title: "Work | CreonTek",
    description: "Selected work and explorations from CreonTek Studio and Growth Engine.",
    path: "/work",
  }),
};

export default function WorkPage() {
  return (
    <div className="page paper">
      <header className="page-head">
        <ScrambleText className="mono page-eyebrow" text="Studio · Growth Engine" />
        <MaskHeading as="h1" text="Selected work & explorations" />
      </header>
      <div className="work-grid">
        {PROJECTS.map((p) => (
          <ProjectCard
            key={p.slug}
            project={p}
            sizes="(max-width: 860px) 92vw, 46vw"
          />
        ))}
      </div>
    </div>
  );
}
