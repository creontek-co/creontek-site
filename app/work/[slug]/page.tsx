import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookButton } from "@/components/ui/Buttons";
import { MaskHeading, ScrambleText } from "@/components/ui/Reveal";
import { shareMeta } from "@/lib/seo";
import { PROJECTS } from "@/lib/site";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${slug}` },
    ...shareMeta({
      title: `${project.title} | CreonTek`,
      description: project.summary,
      path: `/work/${slug}`,
    }),
    // Placeholder case studies stay out of search until they're real.
    robots: project.placeholder ? { index: false } : undefined,
  };
}

type Params = PageProps<"/work/[slug]">["params"];

/**
 * The slug is URL data, so reading it sits inside <Suspense>: navigations into
 * a case study show this page's shell at once instead of waiting. Every slug is
 * prerendered by generateStaticParams, so in production the fallback is rarely
 * seen, and it holds the same space as the real page so nothing jumps.
 */
export default function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  return (
    <Suspense fallback={<CaseStudyShell />}>
      <CaseStudy params={params} />
    </Suspense>
  );
}

function CaseStudyShell() {
  return (
    <article className="page paper" aria-busy="true">
      <header className="page-head case-shell-head" />
      <div className="case-hero case-shell-hero" />
    </article>
  );
}

async function CaseStudy({ params }: { params: Params }) {
  const { slug } = await params;
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const project = PROJECTS[index];
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  return (
    <article className="page paper">
      <header className="page-head">
        <ScrambleText
          className="mono page-eyebrow"
          text={`${project.offer} · ${project.industry}`}
        />
        <MaskHeading as="h1" text={project.title} />
        {project.placeholder ? (
          <p className="placeholder-note mono">
            Placeholder case study: real project content goes here.
          </p>
        ) : null}
      </header>

      <div className="case-hero">
        <Image
          src={project.image}
          alt=""
          fill
          sizes="100vw"
          preload
        />
      </div>

      <div className="case-body">
        <dl className="case-facts">
          <div>
            <dt className="mono">Offer</dt>
            <dd>{project.offer}</dd>
          </div>
          <div>
            <dt className="mono">Industry</dt>
            <dd>{project.industry}</dd>
          </div>
          <div>
            <dt className="mono">Result</dt>
            <dd>{project.result}</dd>
          </div>
          <div>
            <dt className="mono">Delivered</dt>
            <dd>{project.delivered.join(" · ")}</dd>
          </div>
        </dl>
        <div className="case-copy">
          <h2>The challenge</h2>
          <p>{project.challenge}</p>
          <h2>The approach</h2>
          <p>{project.approach}</p>
        </div>
      </div>

      <footer className="case-next">
        <Link href={`/work/${next.slug}`} className="case-next-link">
          <span className="mono">Next project</span>
          {next.title}
        </Link>
        <BookButton />
      </footer>
    </article>
  );
}
