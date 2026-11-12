"use client";

import { useSyncExternalStore } from "react";
import { isSoundOn, setSound, subscribeSound } from "@/lib/sound";

/** The compact version for the mobile header. */
export function SoundIconToggle() {
  const on = useSyncExternalStore(subscribeSound, isSoundOn, () => false);
  return (
    <button
      type="button"
      className="sound-toggle nav-sound-icon"
      aria-label="Sound"
      aria-pressed={on}
      onClick={() => setSound(!on)}
    >
      <svg
        viewBox="0 0 18 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 7v4h2.8L9 14V4L5.3 7H2.5Z" fill="currentColor" />
        {on ? (
          <path d="M11.5 6.5a3.5 3.5 0 0 1 0 5M13.6 4.4a6.5 6.5 0 0 1 0 9.2" />
        ) : (
          <path d="m11.5 7 4 4m0-4-4 4" />
        )}
      </svg>
    </button>
  );
}

export function SoundToggle({ className = "" }: { className?: string }) {
  const on = useSyncExternalStore(subscribeSound, isSoundOn, () => false);
  return (
    <button
      type="button"
      className={`sound-toggle ${className}`}
      aria-pressed={on}
      onClick={() => setSound(!on)}
    >
      <span className="eq" data-on={on ? "1" : ""} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      Sound {on ? "on" : "off"}
    </button>
  );
}
