import Link from "next/link";
import Image from "next/image";
import { optimizedSrc } from "@/lib/img";
import type { Project } from "@/lib/site";
import { LoopVideo } from "./LoopVideo";

export function ProjectCard({
  project,
  sizes = "(max-width: 860px) 80vw, 460px",
}: {
  project: Project;
  sizes?: string;
}) {
  return (
    <article className="project-card">
      <Link
        href={`/work/${project.slug}`}
        data-cursor="View"
        aria-label={`Explore ${project.title}`}
        className="project-media"
      >
        {project.video ? (
          <LoopVideo
            webm=""
            mp4={project.video}
            poster={optimizedSrc(project.image, 384)}
          />
        ) : (
          <Image src={project.image} alt="" fill sizes={sizes} />
        )}
        <span className="project-tag">{project.offer}</span>
        {project.placeholder ? (
          <span className="project-tag project-tag-ph">Placeholder</span>
        ) : null}
      </Link>
      <h3>{project.title}</h3>
      <p className="project-industry">{project.industry}</p>
      <p>{project.result}</p>
      <Link className="text-link" href={`/work/${project.slug}`}>
        Explore project
      </Link>
    </article>
  );
}
