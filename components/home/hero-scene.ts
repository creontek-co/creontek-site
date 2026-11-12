import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { LOGO_PIECES } from "@/lib/logo-paths";
import { heroState } from "./hero-state";

const BLUE = 0x2f5bff;
const SVG_W = 651;
const SVG_H = 684;
const LOGO_SIZE = 3.1;
/** Where the logo rests, as a share of the visible width right of centre. */
const DESKTOP_REST_X = 0.235;
const MOBILE_REST_X = 0.3;

/**
 * Lower than the brief's 64: the logo's outlines are already thousands of tiny
 * curves, so 64 subdivisions added triangles and main-thread time, not detail.
 */
const CURVE_SEGMENTS = 12;

/** Hands the main thread back between slices of scene building. */
const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const ENV_URL = "/media/env-room.bin.gz";
const ENV_LEVELS = [256, 128, 64, 32, 16, 8];
const HALF_ONE = 0x3c00;

/**
 * The RoomEnvironment reflection map, baked ahead of time. Generating it in the
 * browser compiles several shaders on the main thread and stalls the page for
 * about half a second on integrated graphics, so the finished texels ship as a
 * file: half-float RGB, high bytes then low bytes, gzipped.
 */
async function loadBakedEnvironment(renderer: THREE.WebGLRenderer) {
  const res = await fetch(ENV_URL);
  if (!res.ok || !res.body) throw new Error("Environment map unavailable");
  const stream = res.body.pipeThrough(new DecompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());

  const texels = bytes.length / 6;
  const expected = ENV_LEVELS.reduce((n, s) => n + s * s * 6, 0);
  if (texels !== expected) throw new Error("Environment map size mismatch");

  const rgba = new Uint16Array(texels * 4);
  for (let t = 0, c = 0; t < texels; t++) {
    for (let i = 0; i < 3; i++, c++) {
      rgba[t * 4 + i] = (bytes[c] << 8) | bytes[texels * 3 + c];
    }
    rgba[t * 4 + 3] = HALF_ONE;
  }

  const target = new THREE.WebGLCubeRenderTarget(ENV_LEVELS[0], {
    minFilter: THREE.LinearMipmapLinearFilter,
    generateMipmaps: false,
    type: THREE.HalfFloatType,
    colorSpace: THREE.LinearSRGBColorSpace,
    depthBuffer: false,
  });
  const texture = target.texture as THREE.CubeTexture & {
    isPMREMTexture: boolean;
    mipmaps: { width: number; height: number }[];
  };
  ENV_LEVELS.forEach((s) => texture.mipmaps.push({ width: s, height: s }));
  texture.isPMREMTexture = true;
  renderer.initRenderTarget(target);

  const gl = renderer.getContext() as WebGL2RenderingContext;
  const handle = (
    renderer.properties.get(texture) as { __webglTexture: WebGLTexture }
  ).__webglTexture;
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, handle);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  let offset = 0;
  ENV_LEVELS.forEach((size, lod) => {
    for (let face = 0; face < 6; face++) {
      gl.texSubImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
        lod,
        0,
        0,
        size,
        size,
        gl.RGBA,
        gl.HALF_FLOAT,
        rgba,
        offset,
      );
      offset += size * size * 4;
    }
  });
  renderer.resetState();
  return target;
}

/** The slow path, used only if the baked file can't be loaded. */
async function generateEnvironment(renderer: THREE.WebGLRenderer) {
  const { RoomEnvironment } = await import(
    "three/addons/environments/RoomEnvironment.js"
  );
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(new RoomEnvironment(), 0.04);
  pmrem.dispose();
  return target;
}

type PieceData = {
  home: THREE.Vector3;
  dir: THREE.Vector3;
  spin: THREE.Vector3;
};

/**
 * The 3D logo, built in code from the logo's 8 SVG pieces. Each piece is
 * extruded and pivoted on its own centre so it can move independently. The
 * work is sliced so it never blocks the page for long.
 */
export async function createHeroScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  await yieldToMain();
  const scene = new THREE.Scene();
  const envTarget = await loadBakedEnvironment(renderer).catch(() =>
    generateEnvironment(renderer),
  );
  scene.environment = envTarget.texture;
  // The preloader holds still until now, so the slow path can't show as a hitch.
  heroState.settled = true;
  await yieldToMain();

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 5, 6);
  const rim = new THREE.DirectionalLight(BLUE, 5);
  rim.position.set(-6, 2, -4);
  const low = new THREE.PointLight(BLUE, 11, 20);
  low.position.set(3.4, -2.4, 3.4);
  scene.add(key, rim, low);

  const root = new THREE.Group();
  scene.add(root);
  const pivot = new THREE.Group();
  root.add(pivot);
  const S = LOGO_SIZE / SVG_W;
  pivot.scale.set(S, -S, S);

  const parsed = new SVGLoader().parse(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_W} ${SVG_H}">${LOGO_PIECES.map(
      (p) => `<path d="${p.d}" fill="#fff" fill-rule="evenodd"/>`,
    ).join("")}</svg>`,
  ).paths;

  const ringMat = new THREE.MeshPhysicalMaterial({
    color: 0x4a4d55,
    metalness: 0.92,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.6,
    transparent: true,
  });
  const barMats = new Map<number, THREE.MeshPhysicalMaterial>();
  const barMat = (tone: number) => {
    let m = barMats.get(tone);
    if (!m) {
      m = new THREE.MeshPhysicalMaterial({
        color: tone > 0.9 ? 0xf3f3f3 : tone > 0.5 ? 0xa9a9ab : 0x5f6064,
        metalness: 0.9,
        roughness: 0.26,
        clearcoat: 0.6,
        envMapIntensity: 1.2,
        transparent: true,
      });
      barMats.set(tone, m);
    }
    return m;
  };

  const meshes: THREE.Mesh<THREE.ExtrudeGeometry>[] = [];
  const centre = new THREE.Vector3(SVG_W / 2, SVG_H / 2, 0);

  for (let i = 0; i < parsed.length; i++) {
    await yieldToMain();
    const path = parsed[i];
    const meta = LOGO_PIECES[i];
    const shapes = path.toShapes();
    const g = new THREE.ExtrudeGeometry(shapes, {
      depth: meta.kind === "ring" ? 70 : 44,
      bevelEnabled: true,
      bevelThickness: 7,
      bevelSize: 4,
      bevelSegments: 5,
      curveSegments: CURVE_SEGMENTS,
    });
    g.computeBoundingBox();
    const c = new THREE.Vector3();
    g.boundingBox!.getCenter(c);
    g.translate(-c.x, -c.y, -c.z);

    const mesh = new THREE.Mesh(
      g,
      meta.kind === "ring" ? ringMat : barMat(meta.tone),
    );
    const home = new THREE.Vector3(c.x - centre.x, c.y - centre.y, 0);
    mesh.position.copy(home);

    let dir: THREE.Vector3;
    if (meta.kind === "ring") {
      // Ring halves fly up-right and down-left, pushing back in depth.
      dir = home.clone().normalize().multiplyScalar(900);
      dir.z = -200;
    } else {
      // Bars shoot along their slant, alternating left and right.
      const side = i % 2 ? 1 : -1;
      dir = new THREE.Vector3(145, 40, 0)
        .normalize()
        .multiplyScalar(side * (900 + i * 120));
      dir.y += home.y * 1.5;
      dir.z = 500 + i * 60;
    }
    const data: PieceData = {
      home,
      dir,
      spin: new THREE.Vector3(
        (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 1.6,
      ),
    };
    mesh.userData = data;
    pivot.add(mesh);
    meshes.push(mesh);
  }

  const mats = [ringMat, ...barMats.values()];

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
  });
  io.observe(canvas);

  // Shaders compile off the main thread where the browser supports it. A
  // first render without this blocks the page for most of a second.
  await renderer.compileAsync(scene, camera);

  const start = performance.now();
  let k = 0;
  let raf = 0;

  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const t = (performance.now() - start) / 1000;
    const { p, intro, slide } = heroState;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    const wide = camera.aspect > 1.1;
    const kb = smooth(0.5, 0.9, p);
    k += (kb - k) * 0.12;
    const toCentre = smooth(0.46, 0.62, p);

    // Portrait screens: the logo floats large behind the text, centred on it.
    const viewH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    const viewW = viewH * camera.aspect;
    const narrowScale = Math.min(0.8, (viewW * 0.9) / LOGO_SIZE);
    const restY = wide ? -0.1 : -viewH * 0.08;
    const travel = wide ? 1 : 0.6;

    // Resting place on the right. On portrait screens the logo keeps its size
    // and runs off the right edge (the sticky section clips it, so the page
    // never scrolls sideways). Raise MOBILE_REST_X to push it further right.
    const restX = wide ? viewW * DESKTOP_REST_X : viewW * MOBILE_REST_X;
    // Glides in from centre after the preloader, and back to centre on scroll
    // so the break-apart starts from the middle of the screen.
    root.position.x = restX * slide * (1 - toCentre);
    root.position.y = restY * (1 - toCentre) + Math.sin(t * 0.8) * 0.06 * (1 - k);
    root.rotation.y =
      Math.sin(t * 0.35) * 0.22 + mouse.x * 0.3 + toCentre * 0.35 * (1 - k);
    root.rotation.x = Math.cos(t * 0.3) * 0.08 + mouse.y * 0.18;
    root.scale.setScalar(
      (0.82 + 0.18 * intro) * (1 + k * 0.25) * (wide ? 1 : narrowScale),
    );

    meshes.forEach((m) => {
      const u = m.userData as PieceData;
      const d = k * travel;
      m.position.set(
        u.home.x + u.dir.x * d,
        u.home.y + u.dir.y * d,
        u.home.z + u.dir.z * d,
      );
      m.rotation.set(u.spin.x * k, u.spin.y * k, u.spin.z * k);
    });

    const fade = intro * (1 - smooth(0.8, 0.95, p));
    mats.forEach((m) => {
      m.opacity = fade;
    });
    renderer.render(scene, camera);
    heroState.ready = true;
  };
  frame();

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    window.removeEventListener("pointermove", onPointer);
    meshes.forEach((m) => m.geometry.dispose());
    mats.forEach((m) => m.dispose());
    envTarget.dispose();
    renderer.dispose();
  };
}
