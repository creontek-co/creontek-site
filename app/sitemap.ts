import type { MetadataRoute } from "next";
import { PROJECTS, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/studio", "/growth-engine", "/work", "/about", "/contact"];
  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...PROJECTS.filter((p) => !p.placeholder).map((p) => ({
      url: `${SITE_URL}/work/${p.slug}`,
    })),
  ];
}
