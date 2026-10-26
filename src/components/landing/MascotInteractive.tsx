"use client";

import React, { useRef, useEffect, useState } from "react";

function aim(px: number, py: number, cx: number, cy: number, rx: number, ry: number) {
  const sat = (v: number) => v / Math.sqrt(1 + v * v);
  return [sat((px - cx) / rx), sat((py - cy) / ry)];
}

function approach(cur: number, target: number, dt: number, rate: number) {
  return target + (cur - target) * Math.exp(-rate * dt);
}

function pose(x: number, y: number, near: number) {
  return {
    body: { dx: x * 4, dy: 0 },
    head: { dx: x * 10, dy: y * 7, rot: x * 4 },
    ears: { dx: -x * 7, dy: -y * 3, lead: 1 + x * 0.16, trail: 1 - x * 0.16 },
    cap: { dx: x * 12, dy: y * 4 },
    face: { dx: x * 26, dy: y * (y < 0 ? 10 : 18) },
    nose: { dx: x * 10, dy: y * 7 },
    eyes: { dx: x * 4, dy: y * 4, scale: 1 + near * 0.14 },
    brows: { dx: x * 3, dy: y * 2 + Math.min(0, y) * 3 - near * 9 },
    blush: { dx: x * 18, dy: y * 12 },
  };
}

function blink(since: number) {
  const d = 0.15;
  if (since < 0 || since > d) return 1;
  return 1 - Math.sin((Math.PI * since) / d) * 0.92;
}

const CW = 600;
const CH = 700;

export default function MascotInteractive() {
  const rootRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLButtonElement>(null);
  const [happy, setHappy] = useState(false);
  const happyTimer = useRef<number | undefined>(undefined);

  const layers = useRef<Record<string, SVGGElement | null>>({
    body: null,
    head: null,
    earL: null,
    earR: null,
    cap: null,
    face: null,
    nose: null,
    eyes: null,
    brows: null,
    blush: null,
  });

  const poke = () => {
    setHappy(true);
    window.clearTimeout(happyTimer.current);
    happyTimer.current = window.setTimeout(() => setHappy(false), 2400);
  };

  useEffect(() => {
    const root = rootRef.current;
    const char = charRef.current;
    if (!root || !char) return;

    let px = 0;
    let py = 0;
    let lastMove = -1e9;
    let gx = 0;
    let gy = 0;
    let near = 0;
    let prev = performance.now();
    let nextBlink = prev + 1800;
    let blinkAt = -1e9;
    let raf = 0;
    let visible = true;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      lastMove = performance.now();
    };
    const onLeave = () => {
      lastMove = -1e9;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    const tr = (dx: number, dy: number) => `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`;
    const L = layers.current;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || reduceMotion) return;
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;

      const r = char.getBoundingClientRect();
      const cx = r.left + r.width * 0.5;
      const cy = r.top + r.height * 0.48;

      let tx = 0;
      let ty = 0;
      let tn = 0;
      const idle = now - lastMove > 3500;

      if (!idle) {
        const reach = Math.max(window.innerWidth, window.innerHeight);
        [tx, ty] = aim(px, py, cx, cy, reach * 0.32, reach * 0.28);
        const dist = Math.hypot(px - cx, py - cy);
        tn = Math.max(0, 1 - dist / (r.width * 0.5));
      } else {
        const t = now / 1000;
        tx = Math.sin(t * 0.45) * 0.5 + Math.sin(t * 1.1) * 0.1;
        ty = Math.sin(t * 0.32 + 1) * 0.2;
      }

      gx = approach(gx, tx, dt, 7);
      gy = approach(gy, ty, dt, 7);
      near = approach(near, tn, dt, 8);
      const p = pose(gx, gy, near);
      const breathe = Math.sin(now / 620) * 1.6;

      if (now > nextBlink) {
        blinkAt = now;
        nextBlink = now + (Math.random() < 0.25 ? 260 : 2200 + Math.random() * 3200);
      }
      const open = blink((now - blinkAt) / 1000);

      L.body?.setAttribute("transform", tr(p.body.dx, p.body.dy + breathe * 0.4));
      L.head?.setAttribute(
        "transform",
        `${tr(p.head.dx, p.head.dy + breathe)} rotate(${p.head.rot.toFixed(2)} 300 560)`
      );
      L.earL?.setAttribute(
        "transform",
        `${tr(p.ears.dx, p.ears.dy)} translate(138 380) scale(${p.ears.lead.toFixed(3)} 1) translate(-138 -380)`
      );
      L.earR?.setAttribute(
        "transform",
        `${tr(p.ears.dx, p.ears.dy)} translate(462 380) scale(${p.ears.trail.toFixed(3)} 1) translate(-462 -380)`
      );
      L.cap?.setAttribute("transform", tr(p.cap.dx, p.cap.dy));
      L.blush?.setAttribute("transform", tr(p.blush.dx, p.blush.dy));
      L.face?.setAttribute("transform", tr(p.face.dx, p.face.dy));
      L.nose?.setAttribute("transform", tr(p.nose.dx, p.nose.dy));
      L.brows?.setAttribute("transform", tr(p.brows.dx, p.brows.dy));
      L.eyes?.setAttribute(
        "transform",
        `${tr(p.eyes.dx, p.eyes.dy)} translate(300 350) scale(${p.eyes.scale.toFixed(3)} ${(
          p.eyes.scale * open
        ).toFixed(3)}) translate(-300 -350)`
      );
    };

    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      prev = performance.now();
    });
    io.observe(root);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  // Warna tema Pijar Aksara
  const skin = "#f6cfb0";
  const shirt = "#1e3a8a"; // Brand dark blue
  const collar = "#2563eb"; // Brand accent blue
  const cap = "#0f172a"; // Sleek slate cap

  return (
    <div
      ref={rootRef}
      className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center select-none"
    >
      {/* Pendaran Lingkaran Ambient Halus di Belakang Maskot */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-primary/5 to-highlight/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute h-72 w-72 rounded-full border border-border bg-background/70 pointer-events-none" />

      {/* Maskot Karakter Interaktif */}
      <button
        ref={charRef}
        type="button"
        onClick={poke}
        aria-label="Maskot Pembelajar Pijar Aksara"
        className="relative z-10 h-full w-full cursor-pointer border-0 bg-transparent p-0 transition-transform hover:scale-[1.02] focus:outline-none motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <svg
          viewBox={`0 0 ${CW} ${CH}`}
          className="h-full w-full overflow-visible drop-shadow-[0_12px_24px_rgba(15,23,42,0.15)]"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="char-shade" cx="46%" cy="40%" r="62%">
              <stop offset="0.55" stopColor="#7a2e14" stopOpacity="0" />
              <stop offset="1" stopColor="#7a2e14" stopOpacity="0.32" />
            </radialGradient>
            <radialGradient id="char-blush">
              <stop offset="0" stopColor="#ff6f6f" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ff6f6f" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="char-eye" cx="40%" cy="35%" r="70%">
              <stop offset="0" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0f172a" />
            </radialGradient>
            <radialGradient id="char-nose" cx="42%" cy="36%" r="66%">
              <stop offset="0" stopColor="#ff9c82" stopOpacity="0.2" />
              <stop offset="1" stopColor="#b8583a" stopOpacity="0.4" />
            </radialGradient>
          </defs>

          {/* Badan / Pakaian Berkerah Tema Pijar Aksara */}
          <g ref={(el) => { layers.current.body = el; }}>
            <path
              d="M32 720 C44 640 106 600 206 586 L394 586 C494 600 556 640 568 720 Z"
              fill={shirt}
            />
            {/* Leher */}
            <path d="M246 500 L354 500 L360 600 Q300 622 240 600 Z" fill={skin} />
            <path d="M246 500 L354 500 L360 600 Q300 622 240 600 Z" fill="url(#char-shade)" />
            {/* Kerah Kemeja Biru Pijar Aksara */}
            <path d="M236 564 Q262 602 300 626 L250 666 Q214 626 194 592 Z" fill={collar} />
            <path d="M364 564 Q338 602 300 626 L350 666 Q386 626 406 592 Z" fill={collar} />
            {/* Kancing */}
            <circle cx="300" cy="650" r="5" fill="#f8fafc" opacity="0.9" />
            <circle cx="300" cy="690" r="5" fill="#f8fafc" opacity="0.9" />
          </g>

          {/* Kepala & Fitur Wajah */}
          <g ref={(el) => { layers.current.head = el; }}>
            {/* Telinga Kiri & Kanan */}
            <g ref={(el) => { layers.current.earL = el; }}>
              <ellipse cx="138" cy="380" rx="44" ry="58" fill={skin} />
              <ellipse cx="138" cy="380" rx="44" ry="58" fill="url(#char-shade)" />
              <ellipse cx="136" cy="392" rx="22" ry="20" fill="url(#char-blush)" />
            </g>
            <g ref={(el) => { layers.current.earR = el; }}>
              <ellipse cx="462" cy="380" rx="44" ry="58" fill={skin} />
              <ellipse cx="462" cy="380" rx="44" ry="58" fill="url(#char-shade)" />
              <ellipse cx="464" cy="392" rx="22" ry="20" fill="url(#char-blush)" />
            </g>

            {/* Bentuk Wajah */}
            <path
              d="M300 152 C400 152 468 226 468 348 C468 470 394 560 300 560 C206 560 132 470 132 348 C132 226 200 152 300 152 Z"
              fill={skin}
            />
            <path
              d="M300 152 C400 152 468 226 468 348 C468 470 394 560 300 560 C206 560 132 470 132 348 C132 226 200 152 300 152 Z"
              fill="url(#char-shade)"
            />

            {/* Rona Pipi (Blush) */}
            <g ref={(el) => { layers.current.blush = el; }}>
              <ellipse cx="192" cy="428" rx={happy ? 46 : 40} ry={happy ? 30 : 26} fill="url(#char-blush)" />
              <ellipse cx="408" cy="428" rx={happy ? 46 : 40} ry={happy ? 30 : 26} fill="url(#char-blush)" />
            </g>

            {/* Wajah: Alis, Mata, Senyum, Hidung */}
            <g ref={(el) => { layers.current.face = el; }}>
              {/* Alis */}
              <g ref={(el) => { layers.current.brows = el; }}>
                <path
                  d={happy ? "M198 290 Q230 268 264 284" : "M198 298 Q230 280 264 292"}
                  fill="none"
                  stroke="#261b15"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                <path
                  d={happy ? "M336 284 Q370 268 402 290" : "M336 292 Q370 280 402 298"}
                  fill="none"
                  stroke="#261b15"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
              </g>

              {/* Mata Interaktif */}
              <g ref={(el) => { layers.current.eyes = el; }}>
                {happy ? (
                  <>
                    <path
                      d="M214 354 Q240 324 266 354"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="13"
                      strokeLinecap="round"
                    />
                    <path
                      d="M334 354 Q360 324 386 354"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="13"
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <>
                    <ellipse cx="240" cy="348" rx="24" ry="30" fill="url(#char-eye)" />
                    <circle cx="232" cy="336" r="8" fill="#ffffff" />
                    <circle cx="249" cy="358" r="3.5" fill="#ffffff" opacity="0.8" />
                    <ellipse cx="360" cy="348" rx="24" ry="30" fill="url(#char-eye)" />
                    <circle cx="352" cy="336" r="8" fill="#ffffff" />
                    <circle cx="369" cy="358" r="3.5" fill="#ffffff" opacity="0.8" />
                  </>
                )}
              </g>

              {/* Hidung */}
              <g ref={(el) => { layers.current.nose = el; }}>
                <ellipse cx="300" cy="410" rx="26" ry="12" fill="#6b2a14" opacity="0.14" />
                <ellipse cx="300" cy="396" rx="27" ry="24" fill={skin} />
                <ellipse cx="300" cy="396" rx="27" ry="24" fill="url(#char-nose)" />
                <ellipse cx="292" cy="386" rx="9" ry="7" fill="#ffffff" opacity="0.4" />
              </g>

              {/* Senyum */}
              <g transform={happy ? "translate(300 440) scale(1.08 1.14) translate(-300 -440)" : undefined}>
                <path
                  d="M226 448 Q300 488 374 448"
                  fill="none"
                  stroke="#7c2d12"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </g>
            </g>

            {/* Topi Beanie / Rambut Modern */}
            <g ref={(el) => { layers.current.cap = el; }}>
              <path
                d="M128 290 C114 164 196 88 300 88 C404 88 486 164 472 290 Z"
                fill={cap}
              />
              <path
                d="M116 254 Q300 216 484 254 L488 312 Q300 276 112 312 Z"
                fill="#1e293b"
              />
              {/* Garis tekstur rajut */}
              <path
                d="M114 284 Q300 248 486 284"
                fill="none"
                stroke="#334155"
                strokeWidth="2.5"
              />
            </g>
          </g>
        </svg>
      </button>
    </div>
  );
}
