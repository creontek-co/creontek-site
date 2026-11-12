/**
 * Coordinates the door transition with destination heroes. A hero calls
 * whenStageClear on mount: that is the "page is ready" signal, and its intro
 * runs as soon as the overlay releases it. With no transition in flight the
 * intro simply runs straight away.
 */
let holding = false;
let queue: (() => void)[] = [];
let onReady: (() => void) | null = null;

export function holdStage(ready: () => void) {
  holding = true;
  onReady = ready;
}

export function releaseStage() {
  holding = false;
  onReady = null;
  const q = queue;
  queue = [];
  q.forEach((fn) => fn());
}

export function whenStageClear(fn: () => void) {
  if (!holding) {
    fn();
    return () => {};
  }
  queue.push(fn);
  onReady?.();
  return () => {
    queue = queue.filter((f) => f !== fn);
  };
}

export const INTRO_FLAG = "ct-intro";
export const REPLAY_EVENT = "creontek:replay";
