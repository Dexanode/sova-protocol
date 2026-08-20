"use client";
import { useEffect, useRef } from "react";

export default function ParticleBg() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    const H = 720;
    canvas.height = H;

    const COLS = 24, ROWS = 14, SX = 65, SZ = 58, FOV = 380;
    let t = 0, mx = 0, my = 0, raf: number;

    const onResize = () => { W = canvas.width = window.innerWidth; };
    const onMouse  = (e: MouseEvent) => { mx = e.clientX - W / 2; my = e.clientY - 360; };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 1.2;

      type Pt = { sx: number; sy: number; op: number } | null;
      const grid: Pt[][] = [];

      for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < COLS; c++) {
          const x3 = (c - COLS / 2) * SX;
          const z3 = (r - ROWS / 2) * SZ + 310;
          const d  = Math.sqrt(x3 * x3 + (z3 - 310) ** 2);
          let y3   = Math.sin(d * 0.013 - t * 0.018) * 18 + Math.cos(x3 * 0.009 + t * 0.013) * 9;
          const dm = Math.sqrt((x3 - mx) ** 2 + (z3 - 310 - my) ** 2);
          if (dm < 220) y3 += (1 - dm / 220) * 42;

          const sc = FOV / (FOV + z3);
          const sx = x3 * sc + W / 2;
          const sy = y3 * sc + 340;

          const fz = Math.max(0, 1 - z3 / 680);
          const fx = Math.max(0, 1 - Math.abs(c - COLS / 2) / (COLS / 2));
          const op = fz * fx * 0.11;
          grid[r][c] = op > 0 ? { sx, sy, op } : null;
        }
      }

      ctx.lineWidth = 0.6;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 1; c++) {
          const a = grid[r][c], b = grid[r][c + 1];
          if (!a || !b) continue;
          ctx.strokeStyle = `rgba(74,127,255,${(a.op + b.op) / 2})`;
          ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
        }
      }
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 1; r++) {
          const a = grid[r][c], b = grid[r + 1][c];
          if (!a || !b) continue;
          ctx.strokeStyle = `rgba(74,127,255,${(a.op + b.op) / 2})`;
          ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  /* Reduce particle opacity on light bg */
  return (
    <canvas ref={ref} style={{
      position: "absolute", top: 0, left: 0,
      width: "100%", height: "720px",
      pointerEvents: "none", opacity: 0.18, zIndex: 0,
    }} />
  );
}
