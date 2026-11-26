// charts.js — small inline-SVG chart builders. Every chart is drawn from
// the numbers in data.js; nothing is fetched, and no chart library is used.
// Each function returns an SVG string that views.js drops into the page.

const INK = "#1e2a5a";
const RED = "#c8402a";
const TEAL = "#2a7f6f";
const GOLD = "#c99a2e";
const GREY = "#8a8f9e";
const GRID = "#e3e0d8";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Vertical bar chart. points: [{label, value}], valueLabel formats a value.
export function barChart(points, opts = {}) {
  const w = opts.width || 640;
  const h = opts.height || 280;
  const padL = 52;
  const padB = 34;
  const padT = 14;
  const max = Math.max(...points.map((p) => p.value)) * 1.08;
  const plotW = w - padL - 12;
  const plotH = h - padT - padB;
  const bw = plotW / points.length;
  const barW = Math.min(44, bw * 0.62);
  let s = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(opts.label || "Bar chart")}">`;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (plotH * i) / 4;
    const v = max * (1 - i / 4);
    s += `<line x1="${padL}" y1="${y}" x2="${w - 12}" y2="${y}" stroke="${GRID}" stroke-width="1"/>`;
    s += `<text x="${padL - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="${GREY}">${esc(opts.axis ? opts.axis(v) : v.toFixed(0))}</text>`;
  }
  points.forEach((p, i) => {
    const bh = (p.value / max) * plotH;
    const x = padL + i * bw + (bw - barW) / 2;
    const y = padT + plotH - bh;
    const fill = i === points.length - 1 && opts.highlightLast ? RED : p.color || INK;
    s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="2" fill="${fill}"/>`;
    s += `<text x="${(x + barW / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="${INK}">${esc(p.valueLabel || p.value)}</text>`;
    s += `<text x="${(padL + i * bw + bw / 2).toFixed(1)}" y="${h - 12}" text-anchor="middle" font-size="11" fill="${GREY}">${esc(p.label)}</text>`;
  });
  return s + "</svg>";
}

// Line chart. points: [{label, value}]; series: optional second line.
export function lineChart(points, opts = {}) {
  const w = opts.width || 640;
  const h = opts.height || 280;
  const padL = 52;
  const padB = 34;
  const padT = 16;
  const padR = 16;
  const all = points.map((p) => p.value).concat((opts.series || []).map((p) => p.value));
  let min = Math.min(...all);
  let max = Math.max(...all);
  const span = max - min || 1;
  min -= span * 0.15;
  max += span * 0.15;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const x = (i) => padL + (plotW * i) / (points.length - 1);
  const y = (v) => padT + plotH - ((v - min) / (max - min)) * plotH;
  let s = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(opts.label || "Line chart")}">`;
  for (let i = 0; i <= 4; i++) {
    const gy = padT + (plotH * i) / 4;
    const v = max - ((max - min) * i) / 4;
    s += `<line x1="${padL}" y1="${gy}" x2="${w - padR}" y2="${gy}" stroke="${GRID}" stroke-width="1"/>`;
    s += `<text x="${padL - 6}" y="${gy + 4}" text-anchor="end" font-size="11" fill="${GREY}">${esc(opts.axis ? opts.axis(v) : v.toFixed(1))}</text>`;
  }
  const path = (arr) => arr.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  s += `<path d="${path(points)}" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  if (opts.series) {
    s += `<path d="${path(opts.series)}" fill="none" stroke="${RED}" stroke-width="2.5" stroke-linejoin="round"/>`;
  }
  points.forEach((p, i) => {
    s += `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="3.5" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
    if (i % 2 === 0 || i === points.length - 1) {
      s += `<text x="${x(i).toFixed(1)}" y="${(y(p.value) - 10).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="${INK}">${esc(p.valueLabel || p.value)}</text>`;
    }
    s += `<text x="${x(i).toFixed(1)}" y="${h - 12}" text-anchor="middle" font-size="11" fill="${GREY}">${esc(p.label)}</text>`;
  });
  return s + "</svg>";
}

// Horizontal bars, good for ranked lists. rows: [{label, value, valueLabel}].
export function hbarChart(rows, opts = {}) {
  const rowH = opts.rowHeight || 30;
  const w = opts.width || 640;
  const labelW = opts.labelWidth || 170;
  const h = rows.length * rowH + 12;
  const max = Math.max(...rows.map((r) => r.value)) * 1.05;
  const barMax = w - labelW - 64;
  let s = `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(opts.label || "Horizontal bar chart")}">`;
  rows.forEach((r, i) => {
    const y = 6 + i * rowH;
    const bw = (r.value / max) * barMax;
    const fill = r.color || (i === 0 ? RED : INK);
    s += `<text x="${labelW - 8}" y="${y + 15}" text-anchor="end" font-size="12" fill="${INK}">${esc(r.label)}</text>`;
    s += `<rect x="${labelW}" y="${y + 3}" width="${bw.toFixed(1)}" height="16" rx="3" fill="${fill}"/>`;
    s += `<text x="${labelW + bw + 6}" y="${y + 15}" font-size="12" font-weight="600" fill="${INK}">${esc(r.valueLabel || r.value)}</text>`;
  });
  return s + "</svg>";
}

// Donut chart with a centre label. parts: [{label, value, color}].
export function donutChart(parts, opts = {}) {
  const size = opts.size || 220;
  const c = size / 2;
  const r = c - 18;
  const total = parts.reduce((a, p) => a + p.value, 0);
  let acc = 0;
  let s = `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(opts.label || "Donut chart")}">`;
  parts.forEach((p) => {
    const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += p.value;
    const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = c + r * Math.cos(a0);
    const y0 = c + r * Math.sin(a0);
    const x1 = c + r * Math.cos(a1);
    const y1 = c + r * Math.sin(a1);
    s += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${c} ${c} Z" fill="${p.color}"/>`;
  });
  s += `<circle cx="${c}" cy="${c}" r="${r - 34}" fill="#fff"/>`;
  s += `<text x="${c}" y="${c - 4}" text-anchor="middle" font-size="26" font-weight="700" fill="${INK}">${esc(opts.center || "")}</text>`;
  s += `<text x="${c}" y="${c + 16}" text-anchor="middle" font-size="11" fill="${GREY}">${esc(opts.centerSub || "")}</text>`;
  return s + "</svg>";
}

export const COLORS = { ink: INK, red: RED, teal: TEAL, gold: GOLD, grey: GREY };
