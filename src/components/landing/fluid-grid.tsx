"use client";

/**
 * Galaxy, deep-space background
 *
 * Starfield with depth layers, cursor whirlpool, click shockwaves, film grain,
 * nebulae, and three suns running a live three-body simulation.
 *
 * Stability: softened gravity, weak spring anchors on a wandering rotating
 * triangle, short-range repulsion for close passes, strong soft walls plus a
 * hard clamp so suns can never leave the viewport, and a responsive speed
 * governor. Trails are time based, not frame based, so they last the same
 * time at 30Hz, 60Hz, and 120Hz.
 *
 * Reduced motion: physics skipped, suns render as a static triangle.
 * Preference is read with matchMedia and reacts to OS changes.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const TAU = Math.PI * 2;

/* ---------------- knobs ---------------- */
const BASE = "#030409"; // deeper blue black, more like space
const DENSITY = 300; // px squared per particle, lower means more particles
const MAX = 9000; // desktop cap
const RADIUS = 230; // cursor reach
const SWIRL = 1.1; // whirlpool strength
const REPEL = 0.5; // outward push
const GRAIN = 0.025; // film grain intensity
const ORBS = 32; // soft out-of-focus discs
const NEBULAE = 5; // large faint nebula clouds

/* ---------------- three suns (the three-body problem) ---------------- */
const SUN_G = 1.6e6; // gravity constant, px cubed per s squared per unit mass
const SUN_EPS = 130; // softening radius px, dreamy fly-bys, no singularity
const SUN_SEP = 110; // below this separation bodies repel softly, no blobs
const SUN_REPULSE = 300; // short-range repulsion strength px per s squared
const SUN_SPRING = 0.07; // weak spring to each sun's wandering anchor, 1 per s squared
const SUN_WALL = 3.0; // soft edge-wall strength, stronger so slingshots stay on screen
const SUN_MARGIN = 90; // wall engagement distance from viewport edges px
const SUN_TARGET = 85; // target mean speed px per s, governor
const SUN_VMAX = 420; // hard per-body speed cap px per s
const SUN_TRAIL = 150; // trail points, 2.5s at 60 points per second
const SUN_PULL = 0.3; // how hard sun wells tug particles
const SUN_SWIRL = 1.0; // how hard sun wells swirl particles
const SUN_MASS = [1, 0.85, 0.7];
const SUN_CORE_R = [4.6, 4.0, 3.4]; // slightly larger cores
const SUN_GLOW_R = [38, 32, 26]; // slightly larger glows
const SUN_COLORS = [
  { core: "#ffe9c4", glow: "255,196,120", trail: "255,178,92" }, // gold sun
  { core: "#dfe9ff", glow: "150,180,255", trail: "128,158,238" }, // pale blue giant
  { core: "#ffc9b8", glow: "235,120,90", trail: "226,108,82" }, // ember dwarf
];

// color buckets: [rgb, weight]. Weights must sum to 1.0.
const PALETTE: [string, number][] = [
  ["200,210,235", 0.62], // dim cool white
  ["120,140,225", 0.12], // deep blue
  ["225,205,185", 0.06], // muted warm
  ["210,90,90", 0.03], // faint red fleck
  ["150,120,220", 0.03], // faint purple fleck
  ["90,180,225", 0.14], // muted cyan
];
const ALPHAS = [0.18, 0.35, 0.55];
const STYLES: string[] = [];
PALETTE.forEach(([rgb]) => ALPHAS.forEach((a) => STYLES.push(`rgba(${rgb},${a})`)));

const f32 = (n: number) => new Float32Array(n);

type Wave = { x: number; y: number; r: number; p: number };

export function Galaxy({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [reduced, setReduced] = useState(false);

  // Reduced motion, reactive to OS changes.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useLayoutEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let W = 0;
    let H = 0;
    let rectLeft = 0;
    let rectTop = 0;
    let N = 0;
    let px0 = f32(0);
    let py0 = f32(0);
    let pz = f32(0);
    let ps = f32(0);
    let ox = f32(0);
    let oy = f32(0);
    let vx = f32(0);
    let vy = f32(0);
    let bk = new Uint8Array(0);

    // feature stars: brighter, twinkle, soft glow
    let NF = 0;
    let fx = f32(0);
    let fy = f32(0);
    let fz = f32(0);
    let fph = f32(0);
    let fsp = f32(0);

    // orbs, now with a real tint that is actually used
    const orbs: {
      x: number;
      y: number;
      r: number;
      a: number;
      dx: number;
      dy: number;
      tint: "cool" | "warm";
    }[] = [];

    // nebulae: very large, very faint color clouds
    const nebulae: {
      x: number;
      y: number;
      r: number;
      a: number;
      dx: number;
      dy: number;
      tint: number;
    }[] = [];

    // three suns: state + trails
    const sunX = f32(3);
    const sunY = f32(3);
    const sunVX = f32(3);
    const sunVY = f32(3);
    const sunTX = [f32(SUN_TRAIL), f32(SUN_TRAIL), f32(SUN_TRAIL)];
    const sunTY = [f32(SUN_TRAIL), f32(SUN_TRAIL), f32(SUN_TRAIL)];
    let sunHead = 0;
    let sunLen = 0;
    let sunInit = false;
    let sunR = 150; // particle well radius, smaller on lite screens
    let trailAcc = 0;
    const TRAIL_STEP = 1 / 60; // seconds per trail point, time based

    const makeRadial = (
      size: number,
      stops: [number, string][]
    ): HTMLCanvasElement => {
      const s = document.createElement("canvas");
      s.width = s.height = size;
      const o = s.getContext("2d")!;
      const g = o.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      for (const [at, color] of stops) g.addColorStop(at, color);
      o.fillStyle = g;
      o.fillRect(0, 0, size, size);
      return s;
    };

    const orbCool = makeRadial(128, [
      [0, "rgba(190,210,255,0.55)"],
      [0.55, "rgba(170,195,255,0.18)"],
      [1, "rgba(170,195,255,0)"],
    ]);
    const orbWarm = makeRadial(128, [
      [0, "rgba(255,205,175,0.55)"],
      [0.55, "rgba(255,190,160,0.18)"],
      [1, "rgba(255,190,160,0)"],
    ]);

    const nebulaSprites = [
      makeRadial(256, [
        [0, "rgba(130,80,220,0.5)"],
        [0.5, "rgba(110,70,200,0.16)"],
        [1, "rgba(110,70,200,0)"],
      ]),
      makeRadial(256, [
        [0, "rgba(70,110,230,0.5)"],
        [0.5, "rgba(60,100,210,0.16)"],
        [1, "rgba(60,100,210,0)"],
      ]),
      makeRadial(256, [
        [0, "rgba(60,180,200,0.45)"],
        [0.5, "rgba(50,160,180,0.14)"],
        [1, "rgba(50,160,180,0)"],
      ]),
    ];

    // tinted glow sprites, one per sun
    const sunSprites = SUN_COLORS.map((col) =>
      makeRadial(128, [
        [0, `rgba(${col.glow},0.55)`],
        [0.35, `rgba(${col.glow},0.22)`],
        [1, `rgba(${col.glow},0)`],
      ])
    );

    // Precomputed trail styles, so we do not build rgba strings per segment per frame.
    const trailStyles = SUN_COLORS.map((col) => {
      const arr: { style: string; width: number }[] = [];
      for (let k = 0; k < Math.ceil(SUN_TRAIL / 2); k++) {
        const t = 1 - (k * 2) / SUN_TRAIL;
        const a = 0.32 * t * t;
        arr.push({
          style: `rgba(${col.trail},${a.toFixed(3)})`,
          width: 1.0 + 1.9 * t, // slightly wider, longer exposure feel
        });
      }
      return arr;
    });

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
      const cw = c.clientWidth;
      const ch = c.clientHeight;
      // Guard: mounting while hidden gives 0 size and would poison math with NaN.
      if (cw <= 0 || ch <= 0) return;

      W = cw;
      H = ch;
      // Re-read DPR on every build, so zoom does not leave a blurry canvas.
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Cache the rect once per build. The canvas is fixed, so this never
      // changes between builds, and we avoid getBoundingClientRect per move.
      const r = c.getBoundingClientRect();
      rectLeft = r.left;
      rectTop = r.top;

      const lite = W < 700;
      sunR = lite ? 110 : 150;

      N = Math.min(lite ? 2600 : MAX, Math.floor((W * H) / DENSITY));
      const tmp = Array.from({ length: N }, () => {
        // pick a color by weight, weights sum to 1.0
        let roll = Math.random();
        let ci = PALETTE.length - 1;
        for (let i = 0; i < PALETTE.length; i++) {
          roll -= PALETTE[i][1];
          if (roll <= 0) {
            ci = i;
            break;
          }
        }
        const q = Math.random();
        const z = q < 0.6 ? 0.3 : q < 0.88 ? 0.6 : 1;
        const ai = q < 0.6 ? 0 : q < 0.88 ? 1 : 2;
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          z,
          // Slightly larger particles: 1.0 to 2.5 instead of 0.7 to 1.8.
          s: 1.0 + z * Math.random() * 1.5,
          b: ci * 3 + ai,
        };
      }).sort((a, b) => a.b - b.b);
      px0 = f32(N);
      py0 = f32(N);
      pz = f32(N);
      ps = f32(N);
      ox = f32(N);
      oy = f32(N);
      vx = f32(N);
      vy = f32(N);
      bk = new Uint8Array(N);
      tmp.forEach((p, i) => {
        px0[i] = p.x;
        py0[i] = p.y;
        pz[i] = p.z;
        ps[i] = p.s;
        bk[i] = p.b;
      });

      NF = lite ? 40 : 110;
      fx = f32(NF);
      fy = f32(NF);
      fz = f32(NF);
      fph = f32(NF);
      fsp = f32(NF);
      for (let i = 0; i < NF; i++) {
        fx[i] = Math.random() * W;
        fy[i] = Math.random() * H;
        fz[i] = 0.4 + Math.random() * 0.6;
        fph[i] = Math.random() * TAU;
        fsp[i] = 0.5 + Math.random() * 1.8;
      }

      orbs.length = 0;
      for (let i = 0; i < ORBS; i++) {
        orbs.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 8 + Math.pow(Math.random(), 2.5) * 52,
          a: 0.015 + Math.random() * 0.04,
          dx: (Math.random() - 0.5) * 3,
          dy: (Math.random() - 0.5) * 3,
          tint: Math.random() < 0.7 ? "cool" : "warm",
        });
      }

      nebulae.length = 0;
      for (let i = 0; i < NEBULAE; i++) {
        nebulae.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 180 + Math.random() * 240,
          a: 0.035 + Math.random() * 0.045, // very faint, it should feel like dust
          dx: (Math.random() - 0.5) * 1.2,
          dy: (Math.random() - 0.5) * 1.2,
          tint: i % nebulaSprites.length,
        });
      }

      vignette = ctx.createRadialGradient(
        W / 2,
        H / 2,
        Math.min(W, H) * 0.4,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.8
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.7)");

      // three suns: spawn once as a spinning triangle around center
      if (!sunInit) {
        sunInit = true;
        const cx = W * 0.5;
        const cy = H * 0.5;
        const R0 = Math.min(W, H) * 0.24;
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * TAU + 0.7;
          sunX[i] = cx + Math.cos(a) * R0;
          sunY[i] = cy + Math.sin(a) * R0;
          const sp = SUN_TARGET * (0.9 + 0.25 * Math.random());
          sunVX[i] = -Math.sin(a) * sp;
          sunVY[i] = Math.cos(a) * sp;
        }
        sunHead = 0;
        sunLen = 0;
      } else {
        // On resize: keep the dance alive, clamp suns and trails into bounds,
        // do not wipe the trail. Wiping it made every resize flicker.
        for (let i = 0; i < 3; i++) {
          sunX[i] = Math.min(Math.max(sunX[i], 40), W - 40);
          sunY[i] = Math.min(Math.max(sunY[i], 40), H - 40);
        }
        for (let b = 0; b < 3; b++) {
          for (let k = 0; k < SUN_TRAIL; k++) {
            sunTX[b][k] = Math.min(Math.max(sunTX[b][k], 0), W);
            sunTY[b][k] = Math.min(Math.max(sunTY[b][k], 0), H);
          }
        }
      }
    };
    build();

    /* ---------------- interaction ---------------- */
    let mx = W * 0.5;
    let my = H * 0.5;
    let tx = mx;
    let ty = my;
    let moved = false;
    let lastMoveT = -99;
    let T = 0;
    const waves: Wave[] = [];

    const onMove = (e: PointerEvent) => {
      tx = e.clientX - rectLeft;
      ty = e.clientY - rectTop;
      moved = true;
      lastMoveT = T;
    };
    const onDown = (e: PointerEvent) => {
      waves.push({
        x: e.clientX - rectLeft,
        y: e.clientY - rectTop,
        r: 0,
        p: 3,
      });
    };
    if (!reduced) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerdown", onDown);
    }

    // Debounced rebuild. ResizeObserver covers layout changes, window resize
    // covers viewport changes. Without debounce a resize drag rebuilds arrays
    // dozens of times per second.
    let resizeTimer = 0;
    const scheduleBuild = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (c.clientWidth !== W || c.clientHeight !== H) build();
      }, 120);
    };
    const ro = new ResizeObserver(scheduleBuild);
    ro.observe(c);
    window.addEventListener("resize", scheduleBuild);

    /* ---------------- three-body physics ----------------
     * Softened Newtonian gravity between the three masses, one gentle
     * integration substep. h is seconds. Called twice per frame.
     * Each sun is also spring-anchored to a vertex of a slowly rotating
     * triangle: gravity still drives the chaos, but the anchors gently tear
     * apart any tight binary so the dance keeps remixing across the page. */
    const sunStep = (h: number, anchorX: number[], anchorY: number[]) => {
      for (let i = 0; i < 3; i++) {
        let ax = 0;
        let ay = 0;
        for (let j = 0; j < 3; j++) {
          if (j === i) continue;
          const dx = sunX[j] - sunX[i];
          const dy = sunY[j] - sunY[i];
          const d2 = dx * dx + dy * dy + SUN_EPS * SUN_EPS;
          const inv = 1 / (d2 * Math.sqrt(d2));
          const f = SUN_G * SUN_MASS[j] * inv;
          ax += dx * f;
          ay += dy * f;
        }
        // weak spring to this sun's own wandering anchor
        ax += (anchorX[i] - sunX[i]) * SUN_SPRING;
        ay += (anchorY[i] - sunY[i]) * SUN_SPRING;
        // stronger soft walls, so slingshots turn before they leave
        if (sunX[i] < SUN_MARGIN) ax += (SUN_MARGIN - sunX[i]) * SUN_WALL;
        else if (sunX[i] > W - SUN_MARGIN)
          ax -= (sunX[i] - (W - SUN_MARGIN)) * SUN_WALL;
        if (sunY[i] < SUN_MARGIN) ay += (SUN_MARGIN - sunY[i]) * SUN_WALL;
        else if (sunY[i] > H - SUN_MARGIN)
          ay -= (sunY[i] - (H - SUN_MARGIN)) * SUN_WALL;
        sunVX[i] += ax * h;
        sunVY[i] += ay * h;
      }

      // shockwave rings shove the suns as they pass
      for (const w of waves) {
        for (let i = 0; i < 3; i++) {
          const dx = sunX[i] - w.x;
          const dy = sunY[i] - w.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const g = Math.abs(d - w.r);
          if (g < 70 && d > 1) {
            const m = (1 - g / 70) * w.p * 120 * h;
            sunVX[i] += (dx / d) * m;
            sunVY[i] += (dy / d) * m;
          }
        }
      }

      // the pointer can shoo a sun off its course
      if (moved) {
        for (let i = 0; i < 3; i++) {
          const dx = sunX[i] - mx;
          const dy = sunY[i] - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120 && d2 > 1) {
            const d = Math.sqrt(d2);
            const f = (1 - d / 120) * 140 * h;
            sunVX[i] += (dx / d) * f;
            sunVY[i] += (dy / d) * f;
          }
        }
      }

      // short-range soft repulsion: deep fly-bys always slingshot apart,
      // so the trio can never collapse into a permanent blob
      for (let i = 0; i < 3; i++) {
        for (let j = i + 1; j < 3; j++) {
          const dx = sunX[j] - sunX[i];
          const dy = sunY[j] - sunY[i];
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          if (d < SUN_SEP) {
            const f = SUN_REPULSE * (1 - d / SUN_SEP) * h;
            sunVX[i] -= (dx / d) * f;
            sunVY[i] -= (dy / d) * f;
            sunVX[j] += (dx / d) * f;
            sunVY[j] += (dy / d) * f;
          }
        }
      }

      for (let i = 0; i < 3; i++) {
        sunX[i] += sunVX[i] * h;
        sunY[i] += sunVY[i] * h;
      }

      // Hard clamp: guarantee no off-screen escape, even for an extreme
      // slingshot. Velocity reflects with damping so it reads as a bounce
      // off the edge of space, not a teleport.
      for (let i = 0; i < 3; i++) {
        if (sunX[i] < 24) {
          sunX[i] = 24;
          sunVX[i] = Math.abs(sunVX[i]) * 0.6;
        } else if (sunX[i] > W - 24) {
          sunX[i] = W - 24;
          sunVX[i] = -Math.abs(sunVX[i]) * 0.6;
        }
        if (sunY[i] < 24) {
          sunY[i] = 24;
          sunVY[i] = Math.abs(sunVY[i]) * 0.6;
        } else if (sunY[i] > H - 24) {
          sunY[i] = H - 24;
          sunVY[i] = -Math.abs(sunVY[i]) * 0.6;
        }
      }

      // Faster speed governor: exponential correction, clamped to 30 percent.
      // Old version corrected at most 0.1 percent per frame and took seconds
      // to recover from an energized pass. This one recovers in about a second.
      let mean = 0;
      for (let i = 0; i < 3; i++)
        mean += Math.sqrt(sunVX[i] * sunVX[i] + sunVY[i] * sunVY[i]);
      mean /= 3;
      if (mean > 1) {
        const err = (SUN_TARGET - mean) / mean;
        const clamped = Math.max(-0.3, Math.min(0.3, err));
        const s = Math.exp(clamped * h * 3);
        for (let i = 0; i < 3; i++) {
          sunVX[i] *= s;
          sunVY[i] *= s;
          const v = Math.sqrt(sunVX[i] * sunVX[i] + sunVY[i] * sunVY[i]);
          if (v > SUN_VMAX) {
            const f = SUN_VMAX / v;
            sunVX[i] *= f;
            sunVY[i] *= f;
          }
        }
      }
    };

    /* ---------------- frame ---------------- */
    let raf = 0;
    let last = performance.now();
    let frameN = 0;
    let pxs = 0;
    let pys = 0;
    let powerScale = 1;
    let spd = 0;
    let pmx = mx;
    let pmy = my;
    let gx = 0;
    let gy = 0;

    const frame = (now: number) => {
      if (!reduced) raf = requestAnimationFrame(frame);
      const dt = reduced ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      T += dt;
      frameN++;
      const k = dt * 60;
      const damp = Math.pow(0.93, k);

      if (W <= 0 || H <= 0) return;

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
      pmx = mx;
      pmy = my;
      spd += (cs - spd) * 0.15;
      pxs += ((mx / W) * 2 - 1 - pxs) * Math.min(1, 0.04 * k);
      pys += ((my / H) * 2 - 1 - pys) * Math.min(1, 0.04 * k);

      const rad = RADIUS;
      const rad2 = rad * rad;
      const power = powerScale * (1 + Math.min(spd, 40) * 0.04);
      const swirlF = SWIRL * power;
      const repelF = REPEL * power;
      const sY = window.scrollY;

      for (const w of waves) {
        w.r += 9 * k;
        w.p *= Math.pow(0.975, k);
      }
      for (let i = waves.length - 1; i >= 0; i--)
        if (waves[i].p < 0.06) waves.splice(i, 1);

      // the three suns dance around a barycenter that slowly wanders the page;
      // each sun's spring anchor is a vertex of a slowly rotating triangle
      if (!reduced && dt > 0) {
        const cx = W * (0.5 + 0.3 * Math.sin(T * 0.045));
        const cy = H * (0.5 + 0.26 * Math.sin(T * 0.031 + 2.1));
        const triA = T * 0.02;
        const triR = Math.min(W, H) * 0.22;
        const anchorX = [0, 0, 0];
        const anchorY = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
          const a = triA + (i / 3) * TAU;
          anchorX[i] = cx + Math.cos(a) * triR;
          anchorY[i] = cy + Math.sin(a) * triR;
        }
        const h = dt / 2;
        sunStep(h, anchorX, anchorY);
        sunStep(h, anchorX, anchorY);

        // Time-based trails: 60 points per second at any refresh rate.
        trailAcc += dt;
        while (trailAcc >= TRAIL_STEP) {
          trailAcc -= TRAIL_STEP;
          sunHead = (sunHead + 1) % SUN_TRAIL;
          sunLen = Math.min(SUN_TRAIL, sunLen + 1);
          for (let b = 0; b < 3; b++) {
            sunTX[b][sunHead] = sunX[b];
            sunTY[b][sunHead] = sunY[b];
          }
        }
      }

      /* ---- paint ---- */
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      // nebulae: huge, faint, slow. This is what makes it read as space
      // instead of just a starfield on black.
      for (const n of nebulae) {
        let x = (n.x + T * n.dx - pxs * 10) % W;
        if (x < 0) x += W;
        let y = (n.y + T * n.dy - pys * 8 - sY * 0.02) % H;
        if (y < 0) y += H;
        ctx.globalAlpha = n.a;
        const sprite = nebulaSprites[n.tint];
        ctx.drawImage(sprite, x - n.r, y - n.r, n.r * 2, n.r * 2);
      }

      // soft out-of-focus orbs, now actually tinted
      for (const o of orbs) {
        let x = (o.x + T * o.dx - pxs * 14) % W;
        if (x < 0) x += W;
        let y = (o.y + T * o.dy - pys * 10 - sY * 0.04) % H;
        if (y < 0) y += H;
        ctx.globalAlpha = o.a * (0.75 + 0.25 * Math.sin(T * 0.5 + o.x));
        const sprite = o.tint === "cool" ? orbCool : orbWarm;
        ctx.drawImage(sprite, x - o.r, y - o.r, o.r * 2, o.r * 2);
      }

      // particles
      ctx.globalAlpha = 1;
      let cur = -1;
      const sunR2 = sunR * sunR;
      for (let i = 0; i < N; i++) {
        const z = pz[i];
        let hx = (px0[i] + T * z * 4 - pxs * z * 26) % W;
        if (hx < 0) hx += W;
        let hy = (py0[i] - pys * z * 18 - sY * z * 0.1) % H;
        if (hy < 0) hy += H;
        let ax = ox[i];
        let ay = oy[i];
        let bx = vx[i];
        let by = vy[i];

        const dx = hx + ax - mx;
        const dy = hy + ay - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < rad2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = 1 - d / rad;
          const f2 = f * f * (0.4 + z);
          bx += ((dx / d) * repelF - (dy / d) * swirlF) * f2 * k;
          by += ((dy / d) * repelF + (dx / d) * swirlF) * f2 * k;
        }

        // gravity wells of the three suns: particles swirl around each passing mass
        for (let s = 0; s < 3; s++) {
          const sx = hx + ax - sunX[s];
          const sy = hy + ay - sunY[s];
          const sd2 = sx * sx + sy * sy;
          if (sd2 < sunR2 && sd2 > 9) {
            const sd = Math.sqrt(sd2);
            const f = 1 - sd / sunR;
            const g = f * f * (0.35 + z) * k;
            bx += ((sx / sd) * SUN_PULL - (sy / sd) * SUN_SWIRL) * g;
            by += ((sy / sd) * SUN_PULL + (sx / sd) * SUN_SWIRL) * g;
          }
        }

        if (waves.length) {
          for (const w of waves) {
            const wx = hx + ax - w.x;
            const wy = hy + ay - w.y;
            const wd = Math.sqrt(wx * wx + wy * wy);
            const g = Math.abs(wd - w.r);
            if (g < 70) {
              const m = (1 - g / 70) * w.p * 0.7 * k * (0.4 + z);
              bx += (wx / (wd + 1)) * m;
              by += (wy / (wd + 1)) * m;
            }
          }
        }
        bx -= ax * 0.02 * k;
        by -= ay * 0.02 * k;
        bx *= damp;
        by *= damp;
        ax += bx * k;
        ay += by * k;
        ox[i] = ax;
        oy[i] = ay;
        vx[i] = bx;
        vy[i] = by;

        const x = hx + ax;
        const y = hy + ay;
        const b = bk[i];
        if (b !== cur) {
          cur = b;
          ctx.fillStyle = STYLES[b];
          ctx.strokeStyle = STYLES[b];
        }
        const sp = Math.abs(bx) + Math.abs(by);

        if (sp > 0.7) {
          // smear along the flow, with a red/blue split when it is moving fast
          const lx = x - bx * 4;
          const ly = y - by * 4;
          ctx.lineWidth = ps[i];
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(x, y);
          ctx.stroke();
          if (sp > 1.4) {
            ctx.strokeStyle = "rgba(200,60,70,0.35)";
            ctx.beginPath();
            ctx.moveTo(lx + 1.6, ly);
            ctx.lineTo(x + 1.6, y);
            ctx.stroke();
            ctx.strokeStyle = "rgba(70,110,200,0.35)";
            ctx.beginPath();
            ctx.moveTo(lx - 1.6, ly);
            ctx.lineTo(x - 1.6, y);
            ctx.stroke();
            ctx.strokeStyle = STYLES[b];
          }
        } else {
          ctx.fillRect(x, y, ps[i], ps[i]);
        }
      }

      // feature stars: a few brighter, twinkling, softly glowing
      for (let i = 0; i < NF; i++) {
        const z = fz[i];
        let x = (fx[i] + T * z * 4 - pxs * z * 30) % W;
        if (x < 0) x += W;
        let y = (fy[i] - pys * z * 22 - sY * z * 0.1) % H;
        if (y < 0) y += H;
        const tw = 0.5 + 0.5 * Math.sin(T * fsp[i] + fph[i]);
        ctx.globalAlpha = 0.12 * tw * z;
        ctx.drawImage(orbCool, x - 7, y - 7, 14, 14);
        ctx.globalAlpha = 0.3 + 0.2 * tw;
        ctx.fillStyle = "#e8ecf5";
        ctx.fillRect(x - 0.5, y - 0.5, 1.4, 1.4);
      }

      // three suns: long-exposure trails + glowing bodies
      ctx.globalAlpha = 1;
      for (let b = 0; b < 3; b++) {
        const styles = trailStyles[b];
        const n = sunLen;
        for (let s = 0; s < n - 2; s += 2) {
          const idx = s / 2;
          if (idx >= styles.length) break;
          const i0 = (sunHead - s + SUN_TRAIL * 2) % SUN_TRAIL;
          const i1 = (sunHead - s - 2 + SUN_TRAIL * 2) % SUN_TRAIL;
          ctx.strokeStyle = styles[idx].style;
          ctx.lineWidth = styles[idx].width;
          ctx.beginPath();
          ctx.moveTo(sunTX[b], sunTY[b]);
          ctx.lineTo(sunTX[b], sunTY[b]);
          ctx.stroke();
        }
      }
      for (let b = 0; b < 3; b++) {
        const gr = SUN_GLOW_R[b];
        ctx.globalAlpha = 0.55;
        ctx.drawImage(sunSprites[b], sunX[b] - gr, sunY[b] - gr, gr * 2, gr * 2);
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = SUN_COLORS[b].core;
        ctx.beginPath();
        ctx.arc(sunX[b], sunY[b], SUN_CORE_R[b], 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // shockwave rings (click)
      ctx.lineWidth = 1;
      for (const w of waves) {
        ctx.strokeStyle = `rgba(150,180,220,${((w.p / 3) * 0.12).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r, 0, TAU);
        ctx.stroke();
      }

      // film grain: only every third frame, full-screen pattern fills are expensive
      if (frameN % 3 === 0) {
        gx = Math.random() * 220;
        gy = Math.random() * 220;
        ctx.save();
        ctx.translate(-gx, -gy);
        ctx.globalAlpha = GRAIN;
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, W + 220, H + 220);
        ctx.restore();
      }

      // light vignette
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      ro.disconnect();
      window.removeEventListener("resize", scheduleBuild);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [reduced]);

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