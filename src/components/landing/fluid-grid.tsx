"use client";
import { useLayoutEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

const TAU = Math.PI * 2;

/* ---------------- knobs ---------------- */
const BASE = "#0b0c11";      // near-black with a slight blue lean
const DENSITY = 210;         // px² per particle (lower = more particles)
const MAX = 9000;            // desktop cap
const RADIUS = 230;          // cursor reach
const SWIRL = 1.1;           // whirlpool strength
const REPEL = 0.5;           // outward push
const GRAIN = 0.045;         // film grain intensity
const ORBS = 30;             // soft out-of-focus discs

// color buckets: [rgb, weight]
const PALETTE: [string, number][] = [
  ["236,241,255", 0.66], // cool white
  ["150,175,255", 0.1],  // blue
  ["255,228,205", 0.06], // warm
  ["255,95,95", 0.04],   // red fleck
  ["110,255,175", 0.04], // green fleck
  ["110,225,255", 0.1],  // cyan
];
const ALPHAS = [0.28, 0.5, 0.8];
const STYLES: string[] = [];
PALETTE.forEach(([rgb]) => ALPHAS.forEach((a) => STYLES.push(`rgba(${rgb},${a})`)));

const f32 = (n: number) => new Float32Array(n);

type Wave = { x: number; y: number; r: number; p: number };

export function Galaxy({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let W = 0, H = 0;
    let N = 0;
    let px0 = f32(0), py0 = f32(0), pz = f32(0), ps = f32(0);
    let ox = f32(0), oy = f32(0), vx = f32(0), vy = f32(0);
    let bk = new Uint8Array(0);

    // feature stars: brighter, twinkle, soft glow
    let NF = 0;
    let fx = f32(0), fy = f32(0), fz = f32(0), fph = f32(0), fsp = f32(0);

    // orbs
    const orbs: { x: number; y: number; r: number; a: number; dx: number; dy: number; tint: string }[] = [];

    const orbSprite = document.createElement("canvas");
    orbSprite.width = orbSprite.height = 128;
    {
      const o = orbSprite.getContext("2d")!;
      const g = o.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.55, "rgba(255,255,255,0.35)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      o.fillStyle = g; o.fillRect(0, 0, 128, 128);
    }

    // grain tile
    const grainTile = document.createElement("canvas");
    grainTile.width = grainTile.height = 220;
    {
      const g = grainTile.getContext("2d")!;
      const img = g.createImageData(220, 220);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    }
    const grainPattern = ctx.createPattern(grainTile, "repeat")!;

    let vignette!: CanvasGradient;

    const build = () => {
      W = c.clientWidth; H = c.clientHeight;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const lite = W < 700;

      N = Math.min(lite ? 2600 : MAX, Math.floor((W * H) / DENSITY));
      const tmp = Array.from({ length: N }, () => {
        // pick a color by weight
        let r = Math.random(), ci = 0;
        for (let i = 0; i < PALETTE.length; i++) { r -= PALETTE[i][1]; if (r <= 0) { ci = i; break; } }
        const q = Math.random();
        const z = q < 0.6 ? 0.3 : q < 0.88 ? 0.6 : 1;
        const ai = q < 0.6 ? 0 : q < 0.88 ? 1 : 2;
        return {
          x: Math.random() * W, y: Math.random() * H, z,
          s: 0.7 + z * Math.random() * 1.1,
          b: ci * 3 + ai,
        };
      }).sort((a, b) => a.b - b.b);
      px0 = f32(N); py0 = f32(N); pz = f32(N); ps = f32(N);
      ox = f32(N); oy = f32(N); vx = f32(N); vy = f32(N);
      bk = new Uint8Array(N);
      tmp.forEach((p, i) => { px0[i] = p.x; py0[i] = p.y; pz[i] = p.z; ps[i] = p.s; bk[i] = p.b; });

      NF = lite ? 40 : 110;
      fx = f32(NF); fy = f32(NF); fz = f32(NF); fph = f32(NF); fsp = f32(NF);
      for (let i = 0; i < NF; i++) {
        fx[i] = Math.random() * W; fy[i] = Math.random() * H;
        fz[i] = 0.4 + Math.random() * 0.6;
        fph[i] = Math.random() * TAU; fsp[i] = 0.5 + Math.random() * 1.8;
      }

      orbs.length = 0;
      for (let i = 0; i < ORBS; i++) {
        orbs.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 6 + Math.pow(Math.random(), 2.5) * 46,
          a: 0.025 + Math.random() * 0.06,
          dx: (Math.random() - 0.5) * 3, dy: (Math.random() - 0.5) * 3,
          tint: Math.random() < 0.7 ? "cool" : "warm",
        });
      }

      vignette = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.8);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.45)");
    };
    build();

    /* ---------------- interaction ---------------- */
    let mx = W * 0.5, my = H * 0.5, tx = mx, ty = my;
    let moved = false, lastMoveT = -99, T = 0;
    const waves: Wave[] = [];

    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      moved = true; lastMoveT = T;
    };
    const onDown = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      waves.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0, p: 3 });
    };
    if (!reduced) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerdown", onDown);
    }
    window.addEventListener("resize", build);

    /* ---------------- frame ---------------- */
    let raf = 0, last = performance.now(), frameN = 0;
    let pxs = 0, pys = 0, powerScale = 1, spd = 0, pmx = mx, pmy = my;
    let gx = 0, gy = 0;

    const frame = (now: number) => {
      if (!reduced) raf = requestAnimationFrame(frame);
      const dt = reduced ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now; T += dt; frameN++;
      const k = dt * 60;
      const damp = Math.pow(0.93, k);

      // cursor (real, or a ghost when idle so the page keeps moving)
      const idle = !moved || T - lastMoveT > 2.5;
      if (idle && !reduced) {
        tx = W * (0.5 + 0.36 * Math.sin(T * 0.27));
        ty = H * (0.5 + 0.3 * Math.sin(T * 0.41 + 1.3));
      }
      powerScale += ((idle ? 0.65 : 1) - powerScale) * Math.min(1, 0.05 * k);
      mx += (tx - mx) * Math.min(1, 0.25 * k);
      my += (ty - my) * Math.min(1, 0.25 * k);
      const cs = k > 0 ? Math.hypot(mx - pmx, my - pmy) / k : 0;
      pmx = mx; pmy = my;
      spd += (cs - spd) * 0.15;
      pxs += ((mx / W) * 2 - 1 - pxs) * Math.min(1, 0.04 * k);
      pys += ((my / H) * 2 - 1 - pys) * Math.min(1, 0.04 * k);

      const rad = RADIUS, rad2 = rad * rad;
      const power = powerScale * (1 + Math.min(spd, 40) * 0.04);
      const swirlF = SWIRL * power, repelF = REPEL * power;
      const sY = window.scrollY;

      for (const w of waves) { w.r += 9 * k; w.p *= Math.pow(0.975, k); }
      for (let i = waves.length - 1; i >= 0; i--) if (waves[i].p < 0.06) waves.splice(i, 1);

      /* ---- paint ---- */
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      // soft out-of-focus orbs
      for (const o of orbs) {
        let x = (o.x + T * o.dx - pxs * 14) % W; if (x < 0) x += W;
        let y = (o.y + T * o.dy - pys * 10 - sY * 0.04) % H; if (y < 0) y += H;
        ctx.globalAlpha = o.a * (0.75 + 0.25 * Math.sin(T * 0.5 + o.x));
        ctx.drawImage(orbSprite, x - o.r, y - o.r, o.r * 2, o.r * 2);
      }

      // particles
      ctx.globalAlpha = 1;
      let cur = -1;
      for (let i = 0; i < N; i++) {
        const z = pz[i];
        let hx = (px0[i] + T * z * 4 - pxs * z * 26) % W; if (hx < 0) hx += W;
        let hy = (py0[i] - pys * z * 18 - sY * z * 0.1) % H; if (hy < 0) hy += H;
        let ax = ox[i], ay = oy[i], bx = vx[i], by = vy[i];

        const dx = hx + ax - mx, dy = hy + ay - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < rad2 && d2 > 0.01) {
          const d = Math.sqrt(d2), f = 1 - d / rad, f2 = f * f * (0.4 + z);
          bx += ((dx / d) * repelF - (dy / d) * swirlF) * f2 * k;
          by += ((dy / d) * repelF + (dx / d) * swirlF) * f2 * k;
        }
        if (waves.length) {
          for (const w of waves) {
            const wx = hx + ax - w.x, wy = hy + ay - w.y;
            const wd = Math.sqrt(wx * wx + wy * wy), g = Math.abs(wd - w.r);
            if (g < 70) {
              const m = (1 - g / 70) * w.p * 0.7 * k * (0.4 + z);
              bx += (wx / (wd + 1)) * m; by += (wy / (wd + 1)) * m;
            }
          }
        }
        bx -= ax * 0.02 * k; by -= ay * 0.02 * k;
        bx *= damp; by *= damp;
        ax += bx * k; ay += by * k;
        ox[i] = ax; oy[i] = ay; vx[i] = bx; vy[i] = by;

        const x = hx + ax, y = hy + ay;
        const b = bk[i];
        if (b !== cur) { cur = b; ctx.fillStyle = STYLES[b]; ctx.strokeStyle = STYLES[b]; }
        const sp = Math.abs(bx) + Math.abs(by);

        if (sp > 0.7) {
          // smear along the flow, with a red/blue split when it's moving fast
          const lx = x - bx * 4, ly = y - by * 4;
          ctx.lineWidth = ps[i];
          ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.stroke();
          if (sp > 1.4) {
            ctx.strokeStyle = "rgba(255,60,70,0.5)";
            ctx.beginPath(); ctx.moveTo(lx + 1.6, ly); ctx.lineTo(x + 1.6, y); ctx.stroke();
            ctx.strokeStyle = "rgba(70,110,255,0.5)";
            ctx.beginPath(); ctx.moveTo(lx - 1.6, ly); ctx.lineTo(x - 1.6, y); ctx.stroke();
            ctx.strokeStyle = STYLES[b];
          }
        } else {
          ctx.fillRect(x, y, ps[i], ps[i]);
        }
      }

      // feature stars: a few brighter, twinkling, softly glowing
      for (let i = 0; i < NF; i++) {
        const z = fz[i];
        let x = (fx[i] + T * z * 4 - pxs * z * 30) % W; if (x < 0) x += W;
        let y = (fy[i] - pys * z * 22 - sY * z * 0.1) % H; if (y < 0) y += H;
        const tw = 0.5 + 0.5 * Math.sin(T * fsp[i] + fph[i]);
        ctx.globalAlpha = 0.18 * tw * z;
        ctx.drawImage(orbSprite, x - 7, y - 7, 14, 14);
        ctx.globalAlpha = 0.5 + 0.5 * tw;
        ctx.fillStyle = "#f2f6ff";
        ctx.fillRect(x - 0.5, y - 0.5, 1.4, 1.4);
      }

      // shockwave rings (click)
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1;
      for (const w of waves) {
        ctx.strokeStyle = `rgba(190,215,255,${((w.p / 3) * 0.18).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, TAU); ctx.stroke();
      }

      // film grain: jitter the tile every other frame so it crawls
      if (frameN % 2 === 0) { gx = Math.random() * 220; gy = Math.random() * 220; }
      ctx.save();
      ctx.translate(-gx, -gy);
      ctx.globalAlpha = GRAIN;
      ctx.fillStyle = grainPattern;
      ctx.fillRect(0, 0, W + 220, H + 220);
      ctx.restore();

      // light vignette
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 ${className}`}
      style={{ backgroundColor: BASE }}
    >
      <canvas ref={ref} aria-hidden className="h-full w-full" />
    </div>
  );
}