"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/ui/Logo";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { NAV_LINKS } from "@/lib/site";
import { getLenis } from "./SmoothScroll";
import { SoundIconToggle, SoundToggle } from "./SoundToggle";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.classList.toggle("menu-open", open);
  }, [open]);

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <>
      <header className="nav">
        <Link href="/" className="nav-brand" aria-label="CreonTek home">
          <Wordmark />
        </Link>
        <nav className="nav-links" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link"
              aria-current={pathname.startsWith(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-right">
          <SoundToggle className="nav-sound" />
          <Link className="pill" href="/contact">
            Let&apos;s talk
          </Link>
          <SoundIconToggle />
          <button
            type="button"
            className="pill nav-menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        className="mobile-menu"
        data-open={open ? "1" : ""}
        inert={!open}
      >
        <nav aria-label="Mobile">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <SocialLinks className="menu-socials" />
      </div>
    </>
  );
}
