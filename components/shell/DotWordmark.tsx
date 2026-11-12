"use client";

import { useEffect, useRef } from "react";
import { WORDMARK_D } from "@/lib/logo-paths";
import { prefersReduced } from "@/lib/motion";
import { playData } from "@/lib/sound";

const VB = { x: 232, y: 748, w: 1100, h: 184 };
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+·";
const FILL = "·+/";
const RADIUS = 110;
/** Narrower than this and the grid has no cells to sample. */
const MIN_WIDTH = 40;

type Cell = { x: number; y: number; ch: string; heat: number; live: string };

/**
 * The footer's giant wordmark: the real logo sampled onto a character grid.
 * Characters near the cursor scramble and light up blue.
 */
export function DotWordmark() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let cells: Cell[] = [];
    let base: HTMLCanvasElement | null = null;
    let size = 8;
    let w = 0;
    let h = 0;
    let dead = false;

    const font = () =>
      `500 ${size}px ${getComputedStyle(canvas).getPropertyValue("--font-geist-mono") || "monospace"}, monospace`;

    const build = () => {
      // A hidden canvas measures 0. Keep the last render and wait for a size.
      const width = canvas.clientWidth;
      if (dead || width < MIN_WIDTH) return;
      w = width;
      h = Math.round((w * VB.h) / VB.w);
      canvas.style.height = `${h}px`;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      size = Math.max(6, Math.round(w / 170));
      const stepX = size * 0.82;
      const stepY = size * 1.05;

      // Sample the logo shape into a low-resolution mask.
      const cols = Math.floor(w / stepX);
      const rows = Math.floor(h / stepY);
      const mask = document.createElement("canvas");
      mask.width = cols;
      mask.height = rows;
      const m = mask.getContext("2d", { willReadFrequently: true })!;
      m.setTransform(cols / VB.w, 0, 0, rows / VB.h, 0, 0);
      m.translate(-VB.x, -VB.y);
      m.fill(new Path2D(WORDMARK_D), "evenodd");
      const px = m.getImageData(0, 0, cols, rows).data;

      cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (px[(r * cols + c) * 4 + 3] < 110) continue;
          const ch = FILL[(c * 7 + r * 13) % FILL.length];
          cells.push({
            x: (c + 0.5) * stepX,
            y: (r + 0.5) * stepY,
            ch,
            heat: 0,
            live: ch,
          });
        }
      }

      // Pre-render the resting grid; only hot cells are drawn per frame.
      base = document.createElement("canvas");
      base.width = canvas.width;
      base.height = canvas.height;
      const b = base.getContext("2d")!;
      b.scale(dpr, dpr);
      b.font = font();
      b.textAlign = "center";
      b.textBaseline = "middle";
      b.fillStyle = "#8c8a85";
      cells.forEach((cell) => b.fillText(cell.ch, cell.x, cell.y));
      paint();
    };

    const paint = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (base) ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = font();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const c of cells) {
        if (c.heat < 0.02) continue;
        ctx.clearRect(c.x - size * 0.5, c.y - size * 0.6, size, size * 1.2);
        ctx.fillStyle = `rgba(47,91,255,${0.35 + c.heat * 0.65})`;
        ctx.fillText(c.live, c.x, c.y);
      }
    };

    let mx = -1e4;
    let my = -1e4;
    let raf = 0;
    let visible = false;

    const frame = () => {
      raf = 0;
      let hot = false;
      for (const c of cells) {
        const d = Math.hypot(c.x - mx, c.y - my);
        const target = d < RADIUS ? 1 - d / RADIUS : 0;
        c.heat += (target - c.heat) * 0.16;
        if (c.heat > 0.02) {
          hot = true;
          c.live =
            target > 0 && Math.random() < 0.3
              ? CHARS[(Math.random() * CHARS.length) | 0]
              : c.live;
        } else {
          c.live = c.ch;
        }
      }
      paint();
      if (hot && visible) raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      if (Math.random() < 0.4) playData();
      wake();
    };
    const leave = () => {
      mx = my = -1e4;
      wake();
    };

    const reduced = prefersReduced();
    if (!reduced) {
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerleave", leave);
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      if (canvas.clientWidth !== w) build();
    });
    ro.observe(canvas);
    document.fonts?.ready.then(build);
    build();

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="dot-wordmark"
      role="img"
      aria-label="CreonTek"
    />
  );
}
