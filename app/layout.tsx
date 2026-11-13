import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Shell } from "@/components/shell/Shell";
import { PAGE_META, SITE_URL, SOCIALS } from "@/lib/site";
import { INTRO_FLAG } from "@/lib/stage";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Studio only, so other pages don't pay to preload it.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: PAGE_META.home.title, template: "%s | CreonTek" },
  description: PAGE_META.home.description,
  openGraph: {
    siteName: "CreonTek",
    type: "website",
    url: SITE_URL,
    title: PAGE_META.home.title,
    description: PAGE_META.home.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0C",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "CreonTek",
      url: SITE_URL,
      logo: `${SITE_URL}/brand/creontek-logo-black.svg`,
      // Social profiles, so search engines link them to the brand.
      sameAs: SOCIALS.filter((s) => s.href).map((s) => s.href),
      description: PAGE_META.home.description,
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#service`,
      name: "CreonTek",
      url: SITE_URL,
      image: `${SITE_URL}/opengraph-image.png`,
      description: PAGE_META.home.description,
      areaServed: "Worldwide",
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "CreonTek services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Studio",
              url: `${SITE_URL}/studio`,
              description: PAGE_META.studio.description,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Growth Engine",
              url: `${SITE_URL}/growth-engine`,
              description: PAGE_META.growth.description,
            },
          },
        ],
      },
    },
  ],
};

/**
 * Runs before first paint. Marks JS as available, so intro elements can start
 * hidden, and decides whether the home preloader plays. If the app bundle
 * never starts, the page unlocks itself rather than staying black.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(location.pathname==='/'&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('${INTRO_FLAG}')){d.setAttribute('data-preload','1');setTimeout(function(){if(!window.__ctPre)d.removeAttribute('data-preload')},15000)}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
