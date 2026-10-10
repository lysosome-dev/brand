#!/usr/bin/env bash
# Rasterize logo/svg/*.svg into logo/png/. Requires rsvg-convert (brew install librsvg).
set -euo pipefail
cd "$(dirname "$0")/.."
src=logo/svg out=logo/png
rm -rf "$out"; mkdir -p "$out"
for f in "$src"/mark-*.svg; do
  n=$(basename "$f" .svg)
  for s in 16 32 48 64 128 256 512 1024; do rsvg-convert -w $s -h $s "$f" -o "$out/$n-$s.png"; done
done
for f in "$src"/wordmark-*.svg "$src"/lockup-*.svg; do
  n=$(basename "$f" .svg)
  for w in 400 800 1600; do rsvg-convert -w $w "$f" -o "$out/$n-$w.png"; done
done
for s in 500 1024; do rsvg-convert -w $s -h $s "$src/avatar.svg" -o "$out/avatar-$s.png"; done
echo "wrote $(ls "$out" | wc -l | tr -d ' ') PNGs to $out"
