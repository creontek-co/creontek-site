import type { Metadata } from "next";

/** The site's sharing image: a capture of the homepage hero (app/opengraph-image.png). */
export const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "CreonTek: We build technology that moves businesses forward.",
};

/**
 * Open Graph and X (Twitter) card tags for one page. A page that sets its own
 * openGraph replaces the site-wide one entirely, so each page passes through
 * here to keep the image, site name and card type alongside its own title,
 * description and URL.
 */
export function shareMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      url: path,
      siteName: "CreonTek",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}
