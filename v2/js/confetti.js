// ============================================================
// Confetti for the earned-badge celebration
//
// Ported from Melanie's "badge criteria cascade" concept (2026-11-20): a light
// rain of rectangles and dots from the top of the viewport for ~3.2s, drawn on
// a temporary full-screen canvas that ignores the pointer and removes itself
// when the last piece has fallen. Only the motion is ported; nothing else from
// the concept's page design.
//
// Callers must skip this for prefers-reduced-motion — see app-activity.js.
// ============================================================
const COLORS = ["#0d8345", "#0071eb", "#f5a623", "#34d399", "#ff5533"];
const rnd = (a, b) => a + Math.random() * (b - a);

export function confettiRain({ duration = 3200, every = 180, perBurst = 3 } = {}) {
  const canvas = document.createElement("canvas");
  canvas.className = "sx-confetti";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener("resize", resize);

  const particles = [];
  let raf = null;
  let spawning = true;

  function spawn(n) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x: rnd(0, innerWidth), y: rnd(-30, -10),
        vx: rnd(-0.3, 0.3), vy: rnd(0.6, 1.4), g: 0.012,
        w: rnd(4, 7), h: rnd(6, 10),
        rot: rnd(0, 6.28), vr: rnd(-0.08, 0.08),
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 0, ttl: rnd(260, 380),
        shape: Math.random() < 0.3 ? "circle" : "rect",
        sway: rnd(0.4, 1.1), phase: rnd(0, 6.28),
      });
    }
    if (!raf) loop();
  }

  function cleanup() {
    removeEventListener("resize", resize);
    canvas.remove();
  }

  function loop() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++; p.vy += p.g;
      p.x += p.vx + Math.sin(p.life / 22 + p.phase) * p.sway * 0.5;
      p.y += p.vy; p.rot += p.vr;
      const alpha = p.life > p.ttl - 50 ? Math.max(0, (p.ttl - p.life) / 50) : 0.85;
      if (p.life > p.ttl || p.y > innerHeight + 30) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = alpha; ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
      if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, 6.29); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (particles.length) raf = requestAnimationFrame(loop);
    else { raf = null; if (!spawning) cleanup(); }
  }

  const t0 = performance.now();
  (function tick() {
    if (performance.now() - t0 > duration) { spawning = false; if (!raf) cleanup(); return; }
    spawn(perBurst);
    setTimeout(tick, every);
  })();
}
