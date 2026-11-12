import type { Metadata } from "next";
import { Doors } from "@/components/home/Doors";
import { HomeHero } from "@/components/home/HomeHero";
import { HowWeWork } from "@/components/home/HowWeWork";
import { Marquee } from "@/components/home/Marquee";
import { Proof } from "@/components/home/Proof";
import { SelectedWork } from "@/components/home/SelectedWork";
import { WhoWeBuildFor } from "@/components/home/WhoWeBuildFor";
import { BookButton, EnquiryLink } from "@/components/ui/Buttons";
import { MaskHeading } from "@/components/ui/Reveal";
import { PAGE_META, SHOW_PROOF, TESTIMONIALS } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: PAGE_META.home.title },
  description: PAGE_META.home.description,
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <HomeHero />
      <Doors />
      <Marquee />
      <SelectedWork />
      <WhoWeBuildFor />
      <HowWeWork />
      {SHOW_PROOF && TESTIMONIALS.length > 0 ? (
        <Proof items={TESTIMONIALS} />
      ) : null}
      <section className="closing" aria-labelledby="closing-title">
        <MaskHeading id="closing-title" text="Ready to build what's next?" />
        <div className="closing-actions">
          <BookButton />
          <EnquiryLink />
        </div>
      </section>
    </>
  );
}
