// ============================================================
// TREND CHART — the line shown when a metric's "See details" is open
//
//   TrendChart.render(el, {
//     points: [{ label: "Jul", value: 0.031 }, ...],
//     max:    0.10,        // top of the y axis
//     bar:    0.02,        // dashed criteria line
//     kind:   "rate" | "rating",
//   });
//
// Two shapes, per the design (672:65656 rating, 672:64844 rate):
//   rating — 0–5 axis, amber BELOW the criteria line (lower is worse).
//   rate   — 0–10% axis, amber ABOVE it (higher is worse).
// Either way the shading marks the months that missed the bar. Override the
// side with `fill: "above" | "below"`. The band's colour comes from the
// `.trend-band` class so it stays with the page's other status colours.
// ============================================================
(function (global) {
  "use strict";

  const W = 1000;
  const H = 230;
  const PAD_L = 34;
  const PAD_R = 10;
  const TOP = 20;
  const BASE = 180;

  const uid = (() => {
    let n = 0;
    return () => "tc-clip-" + ++n;
  })();

  function render(target, opts) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (!el || !opts || !(opts.points || []).length) return;

    const pts = opts.points;
    const max = opts.max;
    const isRate = opts.kind !== "rating";
    const y = (v) => BASE - (Math.min(v, max) / max) * (BASE - TOP);
    const x = (i) => PAD_L + (i * (W - PAD_L - PAD_R)) / (pts.length - 1);

    // Five gridlines plus the baseline, matching the design's six labels.
    const steps = 5;
    const grid = [];
    for (let i = 0; i <= steps; i++) {
      const v = (max / steps) * (steps - i);
      const gy = TOP + (i * (BASE - TOP)) / steps;
      const label = isRate ? Math.round(v * 100) + "%" : String(Math.round(v));
      grid.push(
        `<line x1="${PAD_L}" y1="${gy}" x2="${W - PAD_R}" y2="${gy}" stroke="#ebeef1" stroke-width="1"/>` +
          `<text x="${PAD_L - 8}" y="${gy + 4}" text-anchor="end" class="chart-axis">${label}</text>`
      );
    }

    const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i)} ${y(p.value)}`).join(" ");
    const months = pts
      .map((p, i) => `<text x="${x(i)}" y="208" text-anchor="middle" class="chart-axis">${p.label}</text>`)
      .join("");

    let band = "";
    if (opts.bar != null) {
      const by = y(opts.bar);
      // Shade whichever side of the criteria line counts as a miss: above it
      // for defect rates, where higher is worse, and below it for rating,
      // where lower is. Close the path along the line and clip to that side —
      // the same trick the DBR portal uses for its over-threshold fill.
      const below = opts.fill ? opts.fill === "below" : !isRate;
      const id = uid();
      const area = `${line} L${x(pts.length - 1)} ${by} L${PAD_L} ${by} Z`;
      const clipY = below ? by : TOP;
      const clipH = below ? BASE - by : by - TOP;
      band =
        `<defs><clipPath id="${id}"><rect x="${PAD_L}" y="${clipY}" width="${W - PAD_L - PAD_R}" height="${Math.max(0, clipH)}"/></clipPath></defs>` +
        `<path d="${area}" class="trend-band" clip-path="url(#${id})"/>` +
        `<line x1="${PAD_L}" y1="${by}" x2="${W - PAD_R}" y2="${by}" stroke="#1a2b49" stroke-width="1.5" stroke-dasharray="6 5"/>`;
    }

    el.innerHTML =
      `<svg viewBox="0 0 ${W} ${H}" class="line-chart" role="img" aria-label="${opts.ariaLabel || "Trend"}">` +
      grid.join("") +
      band +
      `<path d="${line}" fill="none" stroke="#1a2b49" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` +
      months +
      `<circle class="trend-dot" r="4" cx="0" cy="0" hidden/>` +
      "</svg>" +
      `<div class="trend-tip" hidden></div>`;

    attachHover(el, { pts, x, y, isRate, bar: opts.bar });
  }

  // Hover readout (757:29057): a dot on the nearest point and a card giving
  // that month's value against the criteria. The SVG scales with its container,
  // so positions are converted from viewBox units to pixels on each move
  // rather than cached — the panel can be resized while open.
  function attachHover(el, ctx) {
    const svg = el.querySelector(".line-chart");
    const dot = el.querySelector(".trend-dot");
    const tip = el.querySelector(".trend-tip");
    if (!svg || !dot || !tip) return;

    const fmt = (v) =>
      ctx.isRate
        ? (v * 100).toFixed(v * 100 < 1 ? 2 : 1) + "%"
        : v.toFixed(2).replace(/0$/, "");

    function show(e) {
      const rect = svg.getBoundingClientRect();
      if (!rect.width) return;
      const scale = rect.width / W;
      // Nearest point by x, in viewBox units.
      const vx = (e.clientX - rect.left) / scale;
      let i = 0;
      ctx.pts.forEach((_, n) => {
        if (Math.abs(ctx.x(n) - vx) < Math.abs(ctx.x(i) - vx)) i = n;
      });
      const p = ctx.pts[i];

      dot.setAttribute("cx", ctx.x(i));
      dot.setAttribute("cy", ctx.y(p.value));
      dot.hidden = false;

      tip.innerHTML =
        `<p class="trend-tip__label">${escapeHtml(p.date || p.label)}</p>` +
        `<p class="trend-tip__value">${fmt(p.value)}</p>` +
        (ctx.bar != null
          ? `<p class="trend-tip__label">Criteria</p><p class="trend-tip__value">${fmt(ctx.bar)}</p>`
          : "");
      tip.hidden = false;

      // Flip to the left of the dot when it would overflow the container, and
      // clamp vertically so the card stays beside the chart rather than
      // floating off the top — ratings sit near the axis ceiling, so the
      // anchor point is often only a few pixels down.
      const left = ctx.x(i) * scale + 12;
      const half = tip.offsetHeight / 2;
      const top = Math.min(
        Math.max(ctx.y(p.value) * scale, half),
        rect.height - half
      );
      tip.style.top = top + "px";
      tip.style.left =
        left + tip.offsetWidth > rect.width
          ? ctx.x(i) * scale - tip.offsetWidth - 12 + "px"
          : left + "px";
    }

    function hide() {
      dot.hidden = true;
      tip.hidden = true;
    }

    svg.addEventListener("mousemove", show);
    svg.addEventListener("mouseleave", hide);
  }

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  global.TrendChart = { render };
})(window);
