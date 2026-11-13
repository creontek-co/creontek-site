import type { Metadata } from "next";
import { shareMeta } from "@/lib/seo";
import { ContactForm } from "@/components/shell/ContactForm";
import { BookButton } from "@/components/ui/Buttons";
import { MaskHeading, ScrambleText } from "@/components/ui/Reveal";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a strategy call or send CreonTek an enquiry about Studio or Growth Engine.",
  alternates: { canonical: "/contact" },
  ...shareMeta({
    title: "Contact | CreonTek",
    description: "Book a strategy call or send CreonTek an enquiry about Studio or Growth Engine.",
    path: "/contact",
  }),
};

export default function ContactPage() {
  return (
    <div className="page paper contact-page">
      <header className="page-head">
        <ScrambleText className="mono page-eyebrow" text="Let's talk" />
        <MaskHeading as="h1" text="Ready to build what's next?" />
      </header>
      <div className="contact-layout">
        <ContactForm />
        <aside className="contact-aside">
          <h2>Prefer to talk?</h2>
          <p>Pick a time that suits you and we&apos;ll start with your goals.</p>
          <BookButton />
          <a className="text-link" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          <SocialLinks className="contact-socials" />
        </aside>
      </div>
    </div>
  );
}
