#!/usr/bin/env node
// Render captured ANSI terminal output as a brand-styled terminal-window SVG. No dependencies.
// Usage: node scripts/ansi-to-svg.mjs <in.ansi> <out.svg> [--cmd "lysosome scan ..."] [--title "..."] [--theme dark|light]
//
// Text stays live <text> (selectable, small) with per-run textLength so columns line up
// whatever monospace font the viewer has; JetBrains Mono is first in the stack.
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const [inFile, outFile] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!inFile || !outFile) { console.error("usage: ansi-to-svg.mjs <in.ansi> <out.svg> [--cmd ...] [--title ...] [--theme dark|light]"); process.exit(2); }
const cmd = opt("--cmd", "");
const title = opt("--title", "lysosome");
const themeName = opt("--theme", "dark");

// Brand terminal themes (tokens/tokens.json). ANSI colors map to the nearest brand stain.
const THEMES = {
  dark: { bg: "#0b0812", bar: "#1a1526", line: "#2e2643", ink: "#eee8f7", faint: "#6f6585", muted: "#a99fbd",
    ansi: { 31: "#ff4d7e", 32: "#6ef0b0", 33: "#ffc15e", 34: "#92a9ff", 35: "#e08cff", 36: "#7fe3ef", 37: "#eee8f7", 90: "#6f6585" } },
  light: { bg: "#ffffff", bar: "#f3eef9", line: "#e1d9ec", ink: "#1b1426", faint: "#8d84a0", muted: "#5f5573",
    ansi: { 31: "#d11d54", 32: "#0b8a57", 33: "#a35f00", 34: "#3a57d1", 35: "#9a2fc4", 36: "#0b7c8a", 37: "#1b1426", 90: "#8d84a0" } },
};
const T = THEMES[themeName];

const FS = 14, CW = FS * 0.6, LH = 22, PADX = 24, PADT = 62, PADB = 26;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// --- parse ANSI into lines of styled runs
const raw = readFileSync(inFile, "utf8")
  .replace(/[\x00-\x08\x0b\x0c\x0e-\x1a\x1c-\x1f]/g, "") // control chars (script(1) adds ^D^H^H)
  .replace(/\r\n?/g, "\n")
  .replace(/\x1b\[[0-9;]*[A-HJKSTfn]/g, ""); // cursor/erase sequences
const lines = raw.replace(/^\n+|\n+$/g, "").split("\n");
const parsed = lines.map((line) => {
  const runs = [];
  let st = { b: false, d: false, i: false, u: false, fg: null };
  const re = /\x1b\[([0-9;]*)m/g;
  let last = 0, m;
  const push = (text) => { if (text) runs.push({ text, ...st }); };
  while ((m = re.exec(line))) {
    push(line.slice(last, m.index));
    last = re.lastIndex;
    const codes = m[1] === "" ? [0] : m[1].split(";").map(Number);
    st = { ...st };
    for (const c of codes) {
      if (c === 0) st = { b: false, d: false, i: false, u: false, fg: null };
      else if (c === 1) st.b = true;
      else if (c === 2) st.d = true;
      else if (c === 3) st.i = true;
      else if (c === 4) st.u = true;
      else if (c === 22) { st.b = false; st.d = false; }
      else if (c === 23) st.i = false;
      else if (c === 24) st.u = false;
      else if (c === 39) st.fg = null;
      else if ((c >= 30 && c <= 37) || c === 90) st.fg = c;
    }
  }
  push(line.slice(last));
  return runs;
});

const cols = Math.max(...parsed.map((r) => r.reduce((n, x) => n + [...x.text].length, 0)), cmd.length + 2);
const W = Math.ceil(PADX * 2 + cols * CW);
const rows = parsed.length + (cmd ? 2 : 0);
const H = PADT + rows * LH + PADB - 6;

let body = "";
let y = PADT + FS;
const text = (x, s, attrs) => {
  const n = [...s].length;
  return `<text x="${x.toFixed(1)}" y="${y}" textLength="${(n * CW).toFixed(1)}" lengthAdjust="spacingAndGlyphs"${attrs}>${esc(s)}</text>`;
};
if (cmd) {
  body += text(PADX, "$", ` fill="${T.faint}"`) + text(PADX + 2 * CW, cmd, ` font-weight="600"`) + "\n";
  y += LH * 2;
}
for (const runs of parsed) {
  let col = 0;
  for (const r of runs) {
    const chars = [...r.text];
    // leading spaces need no element; trailing spaces neither
    const lead = r.text.match(/^ */)[0].length;
    const s = r.text.trim();
    if (s) {
      let a = "";
      if (r.fg) a += ` fill="${T.ansi[r.fg]}"`;
      else if (r.d) a += ` fill="${T.faint}"`;
      if (r.fg && r.d) a += ` fill-opacity="0.7"`;
      if (r.b) a += ` font-weight="700"`;
      if (r.i) a += ` font-style="italic"`;
      if (r.u) a += ` text-decoration="underline"`;
      body += text(PADX + (col + lead) * CW, s, a);
    }
    col += chars.length;
  }
  body += "\n";
  y += LH;
}

const lights = [0, 1, 2].map((i) => `<circle cx="${22 + i * 18}" cy="20" r="5.5" fill="${T.line}"/>`).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}: terminal output">
<title>${esc(title)}</title>
<rect width="${W}" height="${H}" rx="14" fill="${T.bg}"/>
<path d="M14 0h${W - 28}a14 14 0 0 1 14 14v26H0V14A14 14 0 0 1 14 0z" fill="${T.bar}"/>
<path d="M0 40.5h${W}" stroke="${T.line}"/>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="13.5" fill="none" stroke="${T.line}"/>
${lights}
<text x="${W - 22}" y="24.5" text-anchor="end" font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace" font-size="11" letter-spacing="1" fill="${T.faint}">${esc(title.toUpperCase())}</text>
<g font-family="'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace" font-size="${FS}" fill="${T.ink}" xml:space="preserve">
${body}</g>
</svg>
`;
writeFileSync(outFile, svg);
console.log(`wrote ${outFile} (${W}x${H}, ${parsed.length} lines)`);
