"use client";

import { useEffect, type ReactNode } from "react";
import { restoreSound } from "@/lib/sound";
import { ContactProvider } from "./ContactProvider";
import { Cursor } from "./Cursor";
import { Footer } from "./Footer";
import { Nav } from "./Nav";
import { SmoothScroll } from "./SmoothScroll";
import { SoundDirector } from "./SoundDirector";
import { TransitionProvider } from "./TransitionProvider";

/** Everything that persists across routes. */
export function Shell({ children }: { children: ReactNode }) {
  useEffect(() => restoreSound(), []);
  return (
    <ContactProvider>
      <SmoothScroll />
      <SoundDirector />
      <Cursor />
      <Nav />
      <TransitionProvider>
        <main id="main">{children}</main>
        <Footer />
      </TransitionProvider>
    </ContactProvider>
  );
}
