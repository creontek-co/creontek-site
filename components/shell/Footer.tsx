"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CONTACT_EMAIL, SOCIALS } from "@/lib/site";
import { INTRO_FLAG, REPLAY_EVENT } from "@/lib/stage";
import { DotWordmark } from "./DotWordmark";
import { SoundToggle } from "./SoundToggle";

function LocalTime({ city, zone }: { city: string; zone: string }) {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 15000);
    return () => clearInterval(id);
  }, [zone]);
  return (
    <span className="local-time">
      <span>{city}</span>
      <time>{time}</time>
    </span>
  );
}

export function Footer() {
  const pathname = usePathname();
  const socials = SOCIALS.filter((s) => s.href);

  const replay = () => {
    try {
      sessionStorage.removeItem(INTRO_FLAG);
    } catch {}
    if (pathname === "/") window.dispatchEvent(new Event(REPLAY_EVENT));
    // A full load on purpose: the preloader is decided before first paint.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    else window.location.assign("/");
  };

  return (
    <footer className="footer">
      <div className="footer-cols">
        <nav aria-label="Footer">
          <Link href="/studio">Studio</Link>
          <Link href="/growth-engine">Growth Engine</Link>
          <Link href="/work">Work</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="footer-soon">
          <span>
            Academy <em>Coming soon</em>
          </span>
          <span>
            Labs <em>Coming soon</em>
          </span>
        </div>
        <div className="footer-meta">
          <LocalTime city="Lagos" zone="Africa/Lagos" />
          <LocalTime city="London" zone="Europe/London" />
          <LocalTime city="New York" zone="America/New_York" />
          <LocalTime city="Dubai" zone="Asia/Dubai" />
          <LocalTime city="Amsterdam" zone="Europe/Amsterdam" />
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          {socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <DotWordmark />

      <div className="footer-base">
        <span>© CreonTek</span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <SoundToggle />
          <button type="button" className="replay" onClick={replay}>
            Replay intro
          </button>
        </div>
      </div>
    </footer>
  );
}
