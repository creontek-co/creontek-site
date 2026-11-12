import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using the CreonTek website.",
  alternates: { canonical: "/terms" },
  robots: { index: false },
};

// PLACEHOLDER: a starting draft. Have this reviewed before launch.
export default function TermsPage() {
  return (
    <div className="page paper legal">
      <h1>Terms</h1>
      <h2>This website</h2>
      <p>
        This website describes CreonTek&apos;s services. Prices shown are starting
        points, not quotes. Every project is agreed in its own written proposal.
      </p>
      <h2>Content</h2>
      <p>
        The CreonTek name, logo and the content of this site belong to CreonTek
        unless stated otherwise, and may not be reused without permission.
      </p>
      <h2>Questions</h2>
      <p>
        Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </div>
  );
}
