"use client";

/**
 * Site sound, synthesised entirely with the Web Audio API.
 *
 * Off on every page load, and audible only after the visitor clicks a sound
 * toggle. `on` always means "audible right now".
 */

const FADE = 0.4;
const MASTER_LEVEL = 0.85;

export type Mood = "dark" | "paper" | "gallery";

type Voice = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let dry: GainNode | null = null;
let wet: GainNode | null = null;
let padGain: GainNode | null = null;
let padFilter: BiquadFilterNode | null = null;
let padOscs: OscillatorNode[] = [];
let scrollGain: GainNode | null = null;
let scrollFilter: BiquadFilterNode | null = null;
let scrubGain: GainNode | null = null;
let scrubFilter: BiquadFilterNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let notesTimer = 0;

let on = false;
let mood: Mood = "dark";
const listeners = new Set<() => void>();
const lastPlayed = new Map<string, number>();

/** Chords in Hz. Each world has its own harmony and brightness. */
const MOODS: Record<
  Mood,
  { chord: number[]; filter: number; pad: number; scale: number[] }
> = {
  dark: {
    chord: [55, 82.41, 123.47, 164.81],
    filter: 420,
    pad: 0.16,
    scale: [220, 246.94, 329.63, 369.99, 440, 493.88],
  },
  paper: {
    chord: [73.42, 110, 164.81, 220],
    filter: 760,
    pad: 0.11,
    scale: [293.66, 329.63, 440, 493.88, 587.33, 659.25],
  },
  gallery: {
    chord: [87.31, 130.81, 196, 261.63],
    filter: 1250,
    pad: 0.09,
    scale: [523.25, 587.33, 659.25, 783.99, 880, 1046.5],
  },
};

const SCROLL_TEXTURE: Record<Mood, { type: BiquadFilterType; freq: number; q: number; gain: number }> = {
  // Moving air through a dark room.
  dark: { type: "bandpass", freq: 620, q: 0.5, gain: 0.1 },
  // A pencil dragged across drafting paper.
  paper: { type: "bandpass", freq: 3400, q: 1.5, gain: 0.05 },
  // Silk: high and barely there.
  gallery: { type: "highpass", freq: 5200, q: 0.3, gain: 0.032 },
};

export const isSoundOn = () => on;

export function subscribeSound(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const emit = () => listeners.forEach((fn) => fn());

function trace(name: string) {
  if (process.env.NODE_ENV !== "production") {
    const w = window as unknown as { __ctSfx?: string[] };
    (w.__ctSfx ??= []).push(name);
  }
}

/** True at most once per `ms` for this name, so nothing machine-guns. */
function allow(name: string, ms: number) {
  if (!ctx) return false;
  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? -1e9) < ms) return false;
  lastPlayed.set(name, now);
  return true;
}

function noise(c: AudioContext) {
  if (noiseBuffer) return noiseBuffer;
  const len = c.sampleRate * 3;
  noiseBuffer = c.createBuffer(1, len, c.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return noiseBuffer;
}

/** A small synthetic room, so every sound shares one space. */
function impulse(c: AudioContext, seconds: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    }
  }
  return buf;
}

function loopedNoise(c: AudioContext, into: AudioNode) {
  const s = c.createBufferSource();
  s.buffer = noise(c);
  s.loop = true;
  s.connect(into);
  s.start();
}

function boot() {
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  const c = new Ctor();
  ctx = c;

  master = c.createGain();
  master.gain.value = 0;
  const limiter = c.createDynamicsCompressor();
  limiter.threshold.value = -12;
  limiter.ratio.value = 8;
  master.connect(limiter).connect(c.destination);

  dry = c.createGain();
  dry.connect(master);
  const reverb = c.createConvolver();
  reverb.buffer = impulse(c, 2.2);
  wet = c.createGain();
  wet.gain.value = 0.34;
  wet.connect(reverb).connect(master);

  // The ambient pad: four slowly breathing voices that glide between moods.
  padGain = c.createGain();
  padGain.gain.value = 0;
  padFilter = c.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.Q.value = 0.4;
  padFilter.connect(padGain);
  padGain.connect(dry);
  padGain.connect(wet);
  padOscs = MOODS[mood].chord.map((f, i) => {
    const o = c.createOscillator();
    o.type = i < 2 ? "triangle" : "sine";
    o.frequency.value = f;
    o.detune.value = [-5, 4, -3, 6][i];
    const g = c.createGain();
    g.gain.value = [0.5, 0.34, 0.2, 0.13][i];
    const lfo = c.createOscillator();
    lfo.frequency.value = 0.05 + i * 0.023;
    const depth = c.createGain();
    depth.gain.value = g.gain.value * 0.45;
    lfo.connect(depth).connect(g.gain);
    lfo.start();
    o.connect(g).connect(padFilter!);
    o.start();
    return o;
  });

  // Continuous scroll texture, shaped by the current mood.
  scrollFilter = c.createBiquadFilter();
  scrollGain = c.createGain();
  scrollGain.gain.value = 0;
  scrollFilter.connect(scrollGain).connect(dry);
  scrollGain.connect(wet);
  loopedNoise(c, scrollFilter);

  // Scrubbed effects tied to a section's own scroll progress.
  scrubFilter = c.createBiquadFilter();
  scrubFilter.type = "bandpass";
  scrubFilter.Q.value = 0.7;
  scrubGain = c.createGain();
  scrubGain.gain.value = 0;
  scrubFilter.connect(scrubGain);
  scrubGain.connect(dry);
  scrubGain.connect(wet);
  loopedNoise(c, scrubFilter);

  applyMood(0);
  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __ctAudio?: unknown }).__ctAudio = { ctx: c, master };
  }
  return c;
}

function fadeMaster(value: number) {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(value, t + FADE);
}

function applyMood(glide = 1.6) {
  if (!ctx || !padFilter || !padGain || !scrollFilter) return;
  const t = ctx.currentTime;
  const m = MOODS[mood];
  padOscs.forEach((o, i) =>
    o.frequency.setTargetAtTime(m.chord[i], t, glide / 3),
  );
  padFilter.frequency.setTargetAtTime(m.filter, t, glide / 3);
  padGain.gain.setTargetAtTime(m.pad, t, glide / 3);
  const tex = SCROLL_TEXTURE[mood];
  scrollFilter.type = tex.type;
  scrollFilter.frequency.setTargetAtTime(tex.freq, t, 0.2);
  scrollFilter.Q.setTargetAtTime(tex.q, t, 0.2);
}

export function setMood(next: Mood) {
  if (next === mood) return;
  mood = next;
  applyMood();
}

/** Sparse bell notes over the pad, so the ambience is alive, not a drone. */
function scheduleNotes() {
  clearTimeout(notesTimer);
  if (!on) return;
  notesTimer = window.setTimeout(
    () => {
      if (on && !document.hidden) {
        const s = MOODS[mood].scale;
        const f = s[(Math.random() * s.length) | 0];
        bell(f, 2.6, 0.022);
        if (Math.random() < 0.35) {
          setTimeout(() => bell(f * 1.5, 2.2, 0.012), 240);
        }
      }
      scheduleNotes();
    },
    3500 + Math.random() * 5000,
  );
}

function start() {
  boot();
  ctx?.resume();
  on = true;
  fadeMaster(MASTER_LEVEL);
  scheduleNotes();
  emit();
}

export function setSound(next: boolean) {
  if (next) {
    start();
    toggleOn();
  } else {
    on = false;
    clearTimeout(notesTimer);
    fadeMaster(0);
    emit();
  }
}

/**
 * Sound only ever starts from a click on a sound toggle. Clicks, taps and keys
 * anywhere else never start it, even for a visitor who had it on last time.
 * This only pauses the audio while the tab is hidden.
 */
export function restoreSound() {
  const onVisibility = () => {
    if (!ctx || !on) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

const live = () => (on && ctx && dry && wet ? ctx : null);

type ToneOptions = {
  type?: Voice;
  /** Share sent to the reverb, 0 to 1. */
  room?: number;
  attack?: number;
  /** Seconds from now. */
  at?: number;
  /** Frequency multiplier reached by the end of the note. */
  bend?: number;
};

function tone(freq: number, dur: number, vol: number, opts: ToneOptions = {}) {
  const c = live();
  if (!c) return;
  const { type = "sine", room = 0.3, attack = 0.004, at = 0, bend } = opts;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (bend) o.frequency.exponentialRampToValueAtTime(freq * bend, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(dry!);
  if (room > 0) {
    const send = c.createGain();
    send.gain.value = room;
    g.connect(send).connect(wet!);
  }
  o.start(t);
  o.stop(t + dur + 0.03);
}

/** Struck-metal timbre: a fundamental with inharmonic partials. */
function bell(freq: number, dur: number, vol: number, at = 0) {
  tone(freq, dur, vol, { room: 0.8, at });
  tone(freq * 2.76, dur * 0.45, vol * 0.3, { room: 0.8, at });
  tone(freq * 5.4, dur * 0.2, vol * 0.1, { room: 0.8, at });
}

type BurstOptions = {
  type?: BiquadFilterType;
  q?: number;
  room?: number;
  at?: number;
  to?: number;
};

function burst(dur: number, vol: number, from: number, opts: BurstOptions = {}) {
  const c = live();
  if (!c) return;
  const { type = "bandpass", q = 0.8, room = 0.3, at = 0, to = from } = opts;
  const t = c.currentTime + at;
  const s = c.createBufferSource();
  s.buffer = noise(c);
  const f = c.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g);
  g.connect(dry!);
  if (room > 0) {
    const send = c.createGain();
    send.gain.value = room;
    g.connect(send).connect(wet!);
  }
  s.start(t, Math.random() * 2);
  s.stop(t + dur + 0.03);
}

const once = (name: string, ms: number, fn: () => void) => {
  if (!live() || !allow(name, ms)) return;
  trace(name);
  fn();
};

/* Continuous, scroll-driven */

/** Scroll speed from 0 to 1 sets the level of the mood's scroll texture. */
export function setScrollSpeed(speed: number) {
  if (!live() || !scrollGain) return;
  const level = Math.min(1, speed) ** 1.4 * SCROLL_TEXTURE[mood].gain;
  scrollGain.gain.setTargetAtTime(level, ctx!.currentTime, 0.07);
  if (speed > 0.25) trace("scroll");
}

/** A faint notch every so often while scrolling, voiced per mood. */
export function playScrollNotch() {
  once("notch", 90, () => {
    if (mood === "paper") tone(2300, 0.03, 0.012, { type: "triangle", room: 0 });
    else if (mood === "gallery") tone(2640, 0.09, 0.009, { room: 0.6 });
    else tone(180, 0.05, 0.03, { room: 0.1 });
  });
}

/** Section-progress effects. `level` is 0 to 1, `freq` the filter centre. */
export function setScrub(level: number, freq = 900) {
  if (!live() || !scrubGain || !scrubFilter) return;
  const t = ctx!.currentTime;
  scrubGain.gain.setTargetAtTime(level * 0.16, t, 0.08);
  scrubFilter.frequency.setTargetAtTime(freq, t, 0.1);
  if (level > 0.2) trace("scrub");
}

/* Interface */

export const playHoverLink = () =>
  once("hover-link", 45, () => tone(1680, 0.035, 0.016, { room: 0.1 }));
export const playHoverPill = () =>
  once("hover-pill", 60, () =>
    tone(980, 0.06, 0.024, { type: "triangle", room: 0.2, bend: 1.12 }),
  );
export const playHoverCta = () =>
  once("hover-cta", 120, () => {
    tone(392, 0.2, 0.03, { room: 0.5 });
    tone(587.33, 0.24, 0.022, { room: 0.5, at: 0.05 });
  });
export const playClick = () =>
  once("click", 40, () => {
    tone(1250, 0.04, 0.05, { type: "square", room: 0.1, bend: 0.7 });
    tone(320, 0.05, 0.05, { room: 0 });
  });
export const playConfirm = () =>
  once("confirm", 150, () => {
    tone(392, 0.28, 0.05, { type: "triangle", room: 0.5 });
    tone(587.33, 0.34, 0.045, { type: "triangle", room: 0.5, at: 0.08 });
    tone(783.99, 0.5, 0.035, { room: 0.6, at: 0.16 });
  });
export const playKey = () =>
  once("key", 35, () => burst(0.025, 0.05, 2800, { room: 0.05, q: 2 }));
export const playFocus = () =>
  once("focus", 80, () => tone(740, 0.08, 0.018, { room: 0.3 }));
export const playError = () =>
  once("error", 300, () => {
    tone(196, 0.2, 0.06, { type: "triangle", room: 0.3 });
    tone(164.81, 0.3, 0.06, { type: "triangle", room: 0.3, at: 0.13 });
  });
export const playSuccess = () =>
  once("success", 400, () =>
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      bell(f, 1.5, 0.04, i * 0.09),
    ),
  );
export const playModalOpen = () =>
  once("modal-open", 200, () => burst(0.28, 0.07, 500, { to: 1900 }));
export const playModalClose = () =>
  once("modal-close", 200, () => burst(0.22, 0.05, 1500, { to: 400 }));

function toggleOn() {
  once("toggle-on", 200, () => {
    bell(440, 1.1, 0.05);
    bell(659.25, 1.1, 0.04, 0.09);
  });
}

/* Home */

export const playPiece = (index: number) =>
  once(`piece${index}`, 30, () =>
    tone(320 + index * 95, 0.1, 0.05, { type: "triangle", room: 0.4, bend: 0.8 }),
  );
export const playLetter = (index: number) =>
  once(`letter${index}`, 20, () => bell(440 * 1.1225 ** index, 0.5, 0.022));
export function playLock() {
  once("lock", 400, () => {
    tone(98, 1.6, 0.18, { room: 0.7 });
    tone(196, 1.3, 0.1, { room: 0.7 });
    bell(587.33, 1.8, 0.05, 0.03);
  });
}
export const playBurst = () =>
  once("burst", 400, () => burst(0.9, 0.2, 2400, { to: 240, q: 0.5 }));
export const playChimes = () =>
  once("chimes", 400, () =>
    [1760, 2349.32, 3135.96, 2637.02].forEach((f, i) =>
      bell(f, 1.3, 0.024, i * 0.1),
    ),
  );
export const playRegroup = () =>
  once("regroup", 400, () => burst(0.5, 0.08, 1800, { to: 300 }));
export const playHoverDoor = (studio: boolean) =>
  once("hover-door", 250, () => {
    if (studio) bell(1318.51, 0.9, 0.03);
    else {
      tone(2100, 0.03, 0.03, { type: "triangle", room: 0.2 });
      tone(2100, 0.03, 0.03, { type: "triangle", room: 0.2, at: 0.07 });
    }
  });
export function playDoor() {
  once("door", 500, () => {
    burst(0.95, 0.3, 280, { to: 1800, q: 0.6 });
    tone(82.41, 0.42, 0.34, { room: 0.5, at: 0.34, bend: 0.75 });
    burst(0.05, 0.14, 420, { at: 0.34, q: 1.4 });
  });
}
export const playDoorBack = () =>
  once("door-back", 500, () => burst(0.42, 0.18, 1400, { to: 280 }));
export const playMarqueeWord = (index: number) =>
  once("marquee", 110, () =>
    tone([196, 246.94, 293.66, 369.99][index % 4], 0.2, 0.04, {
      type: "triangle",
      room: 0.5,
    }),
  );
export const playCardPass = (index: number) =>
  once("card", 90, () => {
    burst(0.07, 0.07, 1500, { q: 1.2, room: 0.1 });
    tone(330 + (index % 6) * 44, 0.08, 0.03, { type: "triangle", room: 0.2 });
  });
export const playHoverCard = () =>
  once("hover-card", 140, () => burst(0.09, 0.05, 2600, { q: 1.5, room: 0.15 }));
/** Industry rows pluck up a scale, so the list is playable. */
export const playRow = (index: number) =>
  once(`row${index}`, 70, () => {
    const f = [146.83, 164.81, 220, 246.94, 293.66, 329.63][index % 6];
    tone(f, 0.75, 0.09, { type: "triangle", room: 0.65, bend: 0.998 });
    tone(f * 2, 0.32, 0.03, { room: 0.65 });
  });
/** A card settling on the stack: lower as the stack grows. */
export const playStack = (index: number) =>
  once(`stack${index}`, 300, () => {
    tone(130.81 - index * 16, 0.32, 0.2, { room: 0.45, bend: 0.72 });
    burst(0.06, 0.09, 700, { q: 1, room: 0.2 });
  });
export const playStackBack = () =>
  once("stack-back", 300, () => burst(0.14, 0.05, 900, { q: 1, room: 0.2 }));
export const playClosing = () =>
  once("closing", 1500, () =>
    [220, 329.63, 440, 659.25].forEach((f, i) => bell(f, 2.3, 0.032, i * 0.14)),
  );

/* Growth Engine */

export const playPencil = (dur = 0.5) =>
  once("pencil", 120, () => {
    burst(dur, 0.09, 3800, { q: 2, room: 0.12 });
    burst(dur * 0.6, 0.05, 5200, { q: 2.5, room: 0.1, at: dur * 0.3 });
  });
export const playRuler = () =>
  once("ruler", 60, () => tone(2600, 0.05, 0.03, { type: "triangle", room: 0.15 }));
export const playCount = () =>
  once("count", 55, () => tone(3100, 0.012, 0.012, { type: "square", room: 0 }));
export const playCrosshair = () =>
  once("crosshair", 45, () => tone(3600, 0.012, 0.009, { type: "triangle", room: 0 }));
export const playSnap = () =>
  once("snap", 120, () => tone(1900, 0.05, 0.03, { type: "square", room: 0.1, bend: 1.3 }));
/** Each blueprint stage has its own voice. */
export function playStage(index: number) {
  once(`stage${index}`, 180, () => {
    switch (index) {
      case 0:
        tone(2200, 0.05, 0.03, { type: "triangle", room: 0.2 });
        break;
      case 1:
        burst(0.45, 0.09, 3600, { q: 2, room: 0.15 });
        tone(2600, 0.05, 0.03, { type: "triangle", room: 0.15, at: 0.05 });
        break;
      case 2:
        tone(146.83, 0.22, 0.09, { type: "triangle", room: 0.4 });
        tone(138.59, 0.3, 0.09, { type: "triangle", room: 0.4, at: 0.2 });
        burst(0.5, 0.05, 600, { to: 200, q: 1.5 });
        break;
      case 3:
        [440, 587.33, 880].forEach((f, i) =>
          tone(f, 0.12, 0.04, { type: "square", room: 0.4, at: i * 0.07 }),
        );
        tone(110, 0.8, 0.07, { type: "sawtooth", room: 0.4 });
        break;
      default:
        [293.66, 440, 587.33, 880].forEach((f, i) =>
          bell(f, 2, 0.04, i * 0.1),
        );
    }
  });
}
/** Redrawing a problem diagram: pencil strokes and one blip per step. */
export function playRedraw() {
  once("redraw", 150, () => {
    burst(0.7, 0.07, 3800, { q: 2, room: 0.12 });
    [0.2, 0.32, 0.44, 0.56].forEach((at, i) =>
      tone(523.25 + i * 110, 0.09, 0.03, { type: "triangle", room: 0.3, at }),
    );
  });
}
export const playRowTick = () =>
  once("spec-row", 70, () => tone(1400, 0.03, 0.02, { type: "triangle", room: 0.1 }));
export const playStamp = () =>
  once("stamp", 1200, () => {
    tone(110, 0.2, 0.2, { room: 0.3, bend: 0.7 });
    burst(0.05, 0.13, 900, { q: 1, room: 0.25 });
  });
export const playSchedule = () =>
  once("schedule", 1200, () =>
    [0, 0.07, 0.14, 0.21, 0.28].forEach((at, i) =>
      tone(1200 + i * 150, 0.03, 0.02, { type: "triangle", room: 0.1, at }),
    ),
  );

/* Studio */

export const playGlass = (index: number) =>
  once(`glass${index}`, 70, () => {
    bell([659.25, 783.99, 987.77][index % 3], 1.2, 0.05);
  });
export const playTrail = () =>
  once("trail", 70, () =>
    bell(1046.5 + Math.random() * 500, 0.3, 0.012),
  );
export const playConsidered = () =>
  once("considered", 2000, () => {
    bell(523.25, 3, 0.05);
    bell(783.99, 3, 0.04, 0.12);
    bell(1174.66, 3, 0.03, 0.26);
  });
export const playStatement = () =>
  once("statement", 1500, () => {
    bell(392, 2.4, 0.035);
    bell(587.33, 2.4, 0.025, 0.2);
  });
export const playCare = () =>
  once("care", 1500, () => {
    [349.23, 440, 523.25].forEach((f, i) => bell(f, 1.8, 0.026, i * 0.11));
  });
export const playHoverTier = (index: number) =>
  once(`tier${index}`, 120, () =>
    tone([349.23, 440, 523.25][index % 3], 0.5, 0.035, { room: 0.7 }),
  );
export const playProcess = () =>
  once("process", 1500, () => {
    [0, 0.1, 0.2, 0.3].forEach((at, i) =>
      tone(261.63 * 1.25 ** i, 0.14, 0.03, { room: 0.5, at }),
    );
  });

/* Shared */

export const playFooter = () =>
  once("footer", 1500, () => {
    tone(65.41, 0.8, 0.14, { room: 0.6 });
    bell(261.63, 1.6, 0.025, 0.05);
  });
export const playData = () =>
  once("data", 55, () =>
    tone(1800 + Math.random() * 2600, 0.02, 0.012, { type: "square", room: 0.1 }),
  );
export const playWhoIn = () =>
  once("who", 1500, () => tone(73.42, 0.9, 0.12, { room: 0.7, attack: 0.08 }));
export const playPageIn = () =>
  once("page", 1200, () => bell(329.63, 1.5, 0.028));
