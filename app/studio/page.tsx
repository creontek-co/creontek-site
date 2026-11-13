import type { Metadata } from "next";
import { shareMeta } from "@/lib/seo";
import { GalleryHero } from "@/components/studio/GalleryHero";
import { Services } from "@/components/studio/Services";
import { WorkGallery } from "@/components/studio/WorkGallery";
import { BookButton, EnquiryLink } from "@/components/ui/Buttons";
import { Brighten, FadeUp } from "@/components/ui/Reveal";
import { CARE_PLANS, PAGE_META, STUDIO_PROCESS } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: PAGE_META.studio.title },
  description: PAGE_META.studio.description,
  alternates: { canonical: "/studio" },
  ...shareMeta({
    title: PAGE_META.studio.title,
    description: PAGE_META.studio.description,
    path: "/studio",
  }),
};

const WEEKS = 8;

export default function StudioPage() {
  return (
    <div className="studio-page">
      <GalleryHero />

      <section className="s-statement" aria-label="Our approach">
        <Brighten as="h2" text="We don't build generic websites." />
        <FadeUp>
          <p>
            We create digital experiences that communicate a brand&apos;s value,
            elevate its perception and turn visitors into customers.
          </p>
        </FadeUp>
      </section>

      <Services />
      <WorkGallery />

      <section className="s-process" aria-labelledby="process-title">
        <div className="s-sheet-head">
          <h2 id="process-title">How a project runs</h2>
          <span>Discover → Design → Build → Launch</span>
        </div>
        <table className="s-sheet">
          <thead>
            <tr>
              <th scope="col">Stage</th>
              <th scope="col">Scope</th>
              <th scope="col">Timing</th>
              <th scope="col" className="s-bars-col">
                Timeline
              </th>
            </tr>
          </thead>
          <tbody>
            {STUDIO_PROCESS.map((s) => (
              <tr key={s.step}>
                <th scope="row">{s.step}</th>
                <td>{s.line}</td>
                <td>{s.time}</td>
                <td className="s-bars-col" aria-hidden="true">
                  <div className="s-bar">
                    <i
                      style={{
                        left: `${(s.from / WEEKS) * 100}%`,
                        width: `${(s.span / WEEKS) * 100}%`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="s-care" aria-labelledby="care-title">
        <div className="s-care-head">
          <h2 id="care-title">Care plan</h2>
          <p>Hosting, maintenance, updates and ongoing development.</p>
        </div>
        <div className="s-tiers">
          {CARE_PLANS.map((t) => (
            <article key={t.name} className="s-tier">
              <h3>{t.name}</h3>
              <p className="s-price">{t.price}</p>
              <ul>
                {t.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="s-cta" aria-labelledby="s-cta-title">
        <h2 id="s-cta-title">Let&apos;s build something exceptional.</h2>
        <div className="closing-actions">
          <BookButton />
          <EnquiryLink />
        </div>
      </section>
    </div>
  );
}
