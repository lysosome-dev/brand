#!/usr/bin/env node
// Render design/social.html variants to social/*.png with headless Chromium.
// Setup once: npm install && npx playwright install chromium
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const page = (q) => pathToFileURL(path.join(root, "design/social.html")).href + "?" + q;
const jobs = [
  // [query, width, height, deviceScaleFactor, out]
  ["v=repo&repo=cli", 1280, 640, 1, "social/repo-cli.png"],
  ["v=repo&repo=homebrew-tap", 1280, 640, 1, "social/repo-homebrew-tap.png"],
  ["v=repo&repo=brand", 1280, 640, 1, "social/repo-brand.png"],
  ["v=repo&repo=org", 1280, 640, 1, "social/repo-generic.png"],
  ["v=banner&theme=dark", 1200, 300, 2, "social/banner-dark.png"],
  ["v=banner&theme=light", 1200, 300, 2, "social/banner-light.png"],
  ["v=x-header", 1500, 500, 1, "social/x-header.png"],
  ["v=og", 1200, 630, 1, "social/og.png"],
];
const browser = await chromium.launch();
for (const [q, width, height, dpr, out] of jobs) {
  const p = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: dpr });
  await p.goto(page(q), { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(root, out) });
  await p.close();
  console.log(`wrote ${out} (${width * dpr}x${height * dpr})`);
}
// terminal PNGs: the SVGs inside a page that has JetBrains Mono loaded
for (const name of ["scan-dark", "scan-light", "scan-hero-dark", "scan-hero-light"]) {
  const svg = pathToFileURL(path.join(root, `terminal/${name}.svg`)).href;
  const p = await browser.newPage({ deviceScaleFactor: 2 });
  const fonts = pathToFileURL(path.join(root, "fonts/jetbrains-mono-latin.woff2")).href;
  const markup = readFileSync(fileURLToPath(svg), "utf8");
  await p.setContent(`<style>@font-face{font-family:"JetBrains Mono";src:url("${fonts}");font-weight:400 800}html,body{margin:0;background:transparent}</style>${markup}`);
  await p.evaluate(() => document.fonts.ready);
  const el = await p.$("svg");
  await el.screenshot({ path: path.join(root, `terminal/${name}.png`), omitBackground: true });
  await p.close();
  console.log(`wrote terminal/${name}.png`);
}
await browser.close();
