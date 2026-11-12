/** Shared between the scroll timeline, the preloader and the WebGL scene. */
export const heroState = {
  /** Section scroll progress, 0 to 1. */
  p: 0,
  /** The logo's entrance after the preloader, 0 to 1. */
  intro: 0,
  /** The logo's glide from screen centre to its resting place on the right, 0 to 1. */
  slide: 0,
  /** The 3D scene has rendered, or was never going to. */
  ready: false,
  /** The slow synchronous part of the scene build is over. */
  settled: false,
};
