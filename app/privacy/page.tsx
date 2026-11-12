import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How CreonTek handles personal information.",
  alternates: { canonical: "/privacy" },
  robots: { index: false },
};

// PLACEHOLDER: a starting draft. Have this reviewed before launch.
export default function PrivacyPage() {
  return (
    <div className="page paper legal">
      <h1>Privacy</h1>
      <h2>What we collect</h2>
      <p>
        When you send an enquiry we receive the details you give us: your name,
        email, company, website, budget and message. If you book a call, Calendly
        handles that booking under its own privacy policy.
      </p>
      <h2>How we use it</h2>
      <p>
        We use your details to reply to you and to discuss the work you asked
        about. We don&apos;t sell personal information.
      </p>
      <h2>On this device</h2>
      <p>
        We store two small preferences in your browser: your sound setting, and
        whether you&apos;ve seen the intro animation in this session.
      </p>
      <h2>Your choices</h2>
      <p>
        To see, correct or delete what we hold about you, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </div>
  );
}
