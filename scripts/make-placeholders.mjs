// Generates the placeholder artwork in public/placeholders. Run: node scripts/make-placeholders.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const out = "public/placeholders";
mkdirSync(out, { recursive: true });
const INK = "#0B0D0C", PANEL = "#141815", LINE = "#262A27", MUTE = "#5C635D", FG = "#ECEDE8", ACC = "#C8F751";
const rect = (x, y, w, h, fill, r = 8) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${INK}"/>${body}</svg>`;

// Deterministic pseudo-random so the files are stable between runs.
const rng = (seed) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

function sidebar(r) {
  let s = rect(0, 0, 220, 800, PANEL, 0) + rect(28, 32, 110, 14, FG, 4);
  for (let i = 0; i < 9; i++) s += rect(28, 96 + i * 46, 90 + r() * 70, 10, i === 2 ? ACC : MUTE, 5);
  return s;
}
function cards(y, values) {
  return values.map((v, i) => rect(260 + i * 250, y, 226, 120, PANEL, 14) + rect(284 + i * 250, y + 26, 80, 9, MUTE, 4) +
    `<text x="${284 + i * 250}" y="${y + 92}" font-family="Arial, sans-serif" font-weight="700" font-size="40" fill="${i === 0 ? ACC : FG}">${v}</text>`).join("");
}
function bars(x, y, w, h, r) {
  let s = rect(x, y, w, h, PANEL, 14);
  const n = 14, bw = (w - 80) / n;
  for (let i = 0; i < n; i++) { const bh = 30 + r() * (h - 110); s += rect(x + 40 + i * bw, y + h - 36 - bh, bw - 12, bh, i % 4 === 1 ? ACC : LINE, 5); }
  return s;
}
function line(x, y, w, h, r) {
  let s = rect(x, y, w, h, PANEL, 14), d = "";
  for (let i = 0; i <= 12; i++) d += `${i ? "L" : "M"}${x + 36 + (i * (w - 72)) / 12},${y + h - 50 - r() * (h - 120)} `;
  return s + `<path d="${d}" fill="none" stroke="${ACC}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function table(x, y, w, rows, r) {
  let s = rect(x, y, w, rows * 44 + 40, PANEL, 14);
  for (let i = 0; i < rows; i++) {
    s += rect(x + 28, y + 34 + i * 44, 120 + r() * 80, 9, i ? MUTE : FG, 4) + rect(x + w * 0.45, y + 34 + i * 44, 90 + r() * 60, 9, LINE, 4) +
      rect(x + w - 110, y + 28 + i * 44, 70, 20, i % 3 === 1 ? ACC : LINE, 10);
  }
  return s;
}

const layouts = [
  (r) => sidebar(r) + cards(40, ["490+", "47", "90+", "9"]) + bars(260, 196, 620, 300, r) + line(904, 196, 336, 300, r) + table(260, 524, 980, 5, r),
  (r) => sidebar(r) + cards(40, ["400+", "80+", "1,800", "40"]) + table(260, 196, 560, 7, r) + line(844, 196, 396, 348, r) + bars(260, 572, 980, 200, r),
  (r) => sidebar(r) + cards(40, ["80", "200+", "60+", "50"]) + line(260, 196, 980, 280, r) + table(260, 504, 480, 5, r) + bars(764, 504, 476, 260, r),
  (r) => sidebar(r) + cards(40, ["150", "6", "8,000", "24/7"]) + bars(260, 196, 480, 300, r) + table(764, 196, 476, 6, r) + line(260, 524, 980, 240, r),
];
layouts.forEach((make, i) => writeFileSync(`${out}/project-${i + 1}.svg`, svg(1280, 800, make(rng(11 + i * 7)))));

// Portrait placeholder: monogram on a dotted grid.
let dots = "";
for (let y = 40; y < 1000; y += 40) for (let x = 40; x < 800; x += 40) dots += `<circle cx="${x}" cy="${y}" r="1.5" fill="${LINE}"/>`;
writeFileSync(`${out}/portrait.svg`, svg(800, 1000, dots +
  `<circle cx="400" cy="400" r="150" fill="${PANEL}" stroke="${LINE}" stroke-width="2"/><path d="M130 1000c0-180 120-300 270-300s270 120 270 300z" fill="${PANEL}" stroke="${LINE}" stroke-width="2"/>` +
  `<text x="400" y="440" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="120" fill="${ACC}">JS</text>`));
console.log("placeholders written");
