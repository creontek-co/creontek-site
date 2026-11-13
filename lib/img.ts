import { getImageProps } from "next/image";

/**
 * The optimised URL for a public image at roughly `width` pixels wide (AVIF or
 * WebP, resized by Next.js). For plain <img> tags and video posters, which
 * would otherwise download the full-size original. The URL is the 2x size
 * (about double `width`), so pass half the largest width it is shown at. SVGs
 * are already small, so they pass through untouched.
 */
export function optimizedSrc(src: string, width: number) {
  if (!src || src.endsWith(".svg")) return src;
  return getImageProps({
    src,
    alt: "",
    width,
    height: Math.round(width * 0.625),
  }).props.src;
}
