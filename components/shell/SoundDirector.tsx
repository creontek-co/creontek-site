"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import * as S from "@/lib/sound";

type Scene = { selector: string; mood: S.Mood; enter?: () => void };

/**
 * Every section's sound identity. Whichever section holds the middle of the
 * viewport sets the ambient mood; arriving at it plays its own short cue.
 */
const SCENES: Scene[] = [
  // Home
  { selector: ".home", mood: "dark" },
  { selector: ".doors", mood: "paper", enter: () => S.playRegroup() },
  { selector: ".marquee", mood: "paper" },
  { selector: ".work", mood: "paper", enter: () => S.playHoverCard() },
  { selector: ".who", mood: "dark", enter: S.playWhoIn },
  { selector: ".how", mood: "dark" },
  { selector: ".proof", mood: "paper", enter: S.playPageIn },
  { selector: ".closing", mood: "dark", enter: S.playClosing },
  { selector: ".footer", mood: "dark", enter: S.playFooter },
  // Growth Engine
  { selector: ".dt-hero", mood: "paper" },
  { selector: ".bp", mood: "paper" },
  { selector: ".problems", mood: "paper", enter: () => S.playPencil(0.4) },
  { selector: ".spec", mood: "paper", enter: S.playSchedule },
  { selector: ".tb-wrap", mood: "paper", enter: S.playStamp },
  // Studio
  { selector: ".g-hero", mood: "gallery" },
  { selector: ".s-statement", mood: "gallery", enter: S.playStatement },
  { selector: ".s-services", mood: "gallery" },
  { selector: ".s-gallery", mood: "gallery" },
  { selector: ".s-process", mood: "gallery", enter: S.playProcess },
  { selector: ".s-care", mood: "gallery", enter: S.playCare },
  { selector: ".s-cta", mood: "gallery", enter: S.playStatement },
  // Other pages
  { selector: ".about-hero", mood: "dark", enter: S.playWhoIn },
  { selector: ".page", mood: "paper", enter: S.playPageIn },
];

const NOTCH_PX = 220;
const FULL_SPEED = 3.2; // px per ms that counts as a fast scroll

const indexIn = (el: Element) =>
  Array.prototype.indexOf.call(el.parentElement?.children ?? [], el);

function onHover(t: Element) {
  const row = t.closest(".who-row");
  if (row) return S.playRow(indexIn(row));
  const service = t.closest(".s-service");
  if (service) return S.playGlass(indexIn(service));
  const tier = t.closest(".s-tier");
  if (tier) return S.playHoverTier(indexIn(tier));
  const door = t.closest(".door-card");
  if (door) return S.playHoverDoor(door.classList.contains("door-studio"));
  if (t.closest(".btn")) return S.playHoverCta();
  if (t.closest(".project-media, .s-shot, .about-offer")) return S.playHoverCard();
  if (t.closest(".spec-table tbody tr, .s-sheet tbody tr, .about-steps li")) {
    return S.playRowTick();
  }
  if (t.closest(".pill, .tab, .replay")) return S.playHoverPill();
  if (t.closest("a, button, select, [role=tab]")) return S.playHoverLink();
}

function onClick(t: Element) {
  // Sound toggles, tabs and doors speak for themselves.
  if (t.closest(".sound-toggle, .tab, .door-card")) return;
  if (t.closest(".btn")) return S.playConfirm();
  if (t.closest("a, button, summary, select")) return S.playClick();
}

/** Wires sound to the whole site in one place, so no section is left silent. */
export function SoundDirector() {
  const pathname = usePathname();

  // Interaction: delegated, so it covers every element on every page.
  useEffect(() => {
    let lastHover: Element | null = null;
    const over = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !S.isSoundOn()) return;
      const t = e.target as Element | null;
      if (!t?.closest) return;
      const hit = t.closest(
        "a, button, select, [role=tab], .who-row, .s-service, .s-tier, .door-card, .spec-table tbody tr, .s-sheet tbody tr, .about-steps li",
      );
      if (hit === lastHover) return;
      lastHover = hit;
      if (hit) onHover(hit);
    };
    const click = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t?.closest) onClick(t);
    };
    const key = (e: KeyboardEvent) => {
      // Autofill fires keydown events with no `key`, so check its type first.
      if (
        typeof e.key === "string" &&
        e.key.length === 1 &&
        (e.target as Element | null)?.matches?.("input, textarea")
      ) {
        S.playKey();
      }
    };
    const focus = (e: FocusEvent) => {
      if ((e.target as Element).matches?.("input, textarea, select")) S.playFocus();
    };
    window.addEventListener("pointerover", over);
    window.addEventListener("click", click, true);
    window.addEventListener("keydown", key);
    window.addEventListener("focusin", focus);
    return () => {
      window.removeEventListener("pointerover", over);
      window.removeEventListener("click", click, true);
      window.removeEventListener("keydown", key);
      window.removeEventListener("focusin", focus);
    };
  }, []);

  // Scroll: a texture that follows speed, and faint notches over distance.
  useEffect(() => {
    let lastY = window.scrollY;
    let lastT = performance.now();
    let travelled = 0;
    let idle = 0;
    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dy = Math.abs(y - lastY);
      const dt = Math.max(1, now - lastT);
      lastY = y;
      lastT = now;
      S.setScrollSpeed(dy / dt / FULL_SPEED);
      travelled += dy;
      if (travelled > NOTCH_PX) {
        travelled = 0;
        S.playScrollNotch();
      }
      clearTimeout(idle);
      idle = window.setTimeout(() => S.setScrollSpeed(0), 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Sections: whichever crosses the viewport's centre line is the active one.
  useEffect(() => {
    let active: Element | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.target === active) continue;
          active = entry.target;
          const scene = SCENES.find((s) => entry.target.matches(s.selector));
          if (!scene) continue;
          S.setMood(scene.mood);
          scene.enter?.();
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    // New routes render after the path changes, so look again a moment later.
    const scan = () => {
      SCENES.forEach((s) =>
        document.querySelectorAll(s.selector).forEach((el) => io.observe(el)),
      );
    };
    const id = window.setTimeout(scan, 250);
    return () => {
      clearTimeout(id);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
