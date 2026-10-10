#!/usr/bin/env node
// Generates tokens/tokens.css from tokens/tokens.json (W3C design-tokens format).
// No dependencies. Usage: node scripts/build-tokens.mjs [--check]
//   --check  exit 1 if tokens.css is out of date (for CI)
//
// Naming: every token becomes --ly-<path-joined-by-dashes>, e.g.
//   color.tier.review   -> --ly-color-tier-review
//   font.family.display -> --ly-font-family-display
// $value is the dark (default) theme; $extensions["dev.lysosome.modes"].light
// overrides it under prefers-color-scheme: light and [data-theme="light"].
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "tokens/tokens.json");
const out = join(root, "tokens/tokens.css");
const MODES = "dev.lysosome.modes";
const CSS = "dev.lysosome.css";
const GENERIC = new Set(["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui",
  "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded", "-apple-system"]);

const dim = (v) => (typeof v === "object" ? `${v.value}${v.unit}` : String(v));

function format(type, value) {
  switch (type) {
    case "dimension":
      return dim(value);
    case "fontFamily":
      return [].concat(value).map((f) => (GENERIC.has(f) || !/\s/.test(f) ? f : `"${f}"`)).join(", ");
    case "shadow":
      return [].concat(value)
        .map((s) => `${s.inset ? "inset " : ""}${dim(s.offsetX)} ${dim(s.offsetY)} ${dim(s.blur)} ${dim(s.spread)} ${s.color}`)
        .join(", ");
    case "number":
    case "fontWeight":
    case "color":
      return String(value);
    default:
      throw new Error(`unsupported $type ${type}`);
  }
}

const base = [];
const light = [];
function walk(node, path, inheritedType) {
  const type = node.$type ?? inheritedType;
  if ("$value" in node) {
    if (!type) throw new Error(`token ${path.join(".")} has no $type`);
    const name = `--ly-${path.join("-")}`;
    const css = node.$extensions?.[CSS];
    base.push([name, css ?? format(type, node.$value), node.$description]);
    const l = node.$extensions?.[MODES]?.light;
    if (l !== undefined) light.push([name, format(type, l)]);
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (!k.startsWith("$") && v && typeof v === "object") walk(v, [...path, k], type);
  }
}
walk(JSON.parse(readFileSync(src, "utf8")), [], undefined);

const decl = (rows, indent) => rows.map(([n, v]) => `${indent}${n}: ${v};`).join("\n");
const css = `/* lysosome design tokens. GENERATED from tokens/tokens.json by scripts/build-tokens.mjs. Do not edit. */
/* Dark is the default theme; light follows prefers-color-scheme unless [data-theme] pins one. */
:root {
${decl(base, "  ")}
  color-scheme: dark;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
${decl(light, "    ")}
    color-scheme: light;
  }
}

:root[data-theme="light"] {
${decl(light, "  ")}
  color-scheme: light;
}
`;

if (process.argv.includes("--check")) {
  let current = "";
  try { current = readFileSync(out, "utf8"); } catch {}
  if (current !== css) {
    console.error("tokens/tokens.css is out of date: run node scripts/build-tokens.mjs");
    process.exit(1);
  }
  console.log("tokens/tokens.css is up to date");
} else {
  writeFileSync(out, css);
  console.log(`wrote tokens/tokens.css (${base.length} tokens, ${light.length} light overrides)`);
}
