#!/usr/bin/env bash
# Rebuild the terminal art from real `lysosome scan` output on a synthetic demo tree.
#   terminal/render.sh <path-to-lysosome-binary> <empty-scratch-dir>
# Needs macOS (APFS clones keep the ~14 GB demo tree at ~70 MB of real disk) and script(1).
# The scratch dir path is rewritten to /Users/dev so no real path is ever published.
set -euo pipefail
bin="$1"; dir="$2"; here="$(cd "$(dirname "$0")" && pwd)"
H="$dir/home"
"$here/make-demo-tree.sh" "$H"
# The CLI picks its tier palette from the terminal: truecolor gives the exact brand hex, and
# LYSOSOME_THEME picks the dark or light hues, so each SVG theme gets its own real capture.
# scan*.ansi in this folder are the dark captures; the light ones stay in the scratch dir.
capture() { # theme out.ansi
  ( cd "$H" && env -u NO_COLOR -u COLORFGBG HOME="$H" TERM=xterm-256color COLORTERM=truecolor LYSOSOME_THEME="$1" \
      script -q "$dir/scan-$1.raw" sh -c "\"$bin\" scan \"$H/code\" \"$H/.worktrees\" --no-system 2>/dev/null" >/dev/null )
  LC_ALL=C perl -pe "s#\Q$H\E#/Users/dev#g; s/\r\$//; s/[\x04\x08]//g" "$dir/scan-$1.raw" | perl -0pe 's/\A\^D\n?//; s/\^D\s*\z/\n/' > "$2"
}
variants() { # full.ansi short.ansi hero.ansi
  # short version for READMEs: drop the copy-paste cleanup commands block
  awk '/Suggested cleanup/{skip=1} skip&&/Removing a worktree keeps/{skip=0; getline; next} !skip' "$1" > "$2"
  # hero version: summary + worktrees only (drops the project section), keeps the closing line
  awk '/Project build & dependency output/{skip=1} /^ *.*Scanned [0-9]+ folders/{skip=0} !skip' "$2" > "$3"
}
capture dark "$here/scan.ansi";  variants "$here/scan.ansi" "$here/scan-short.ansi" "$here/scan-hero.ansi"
capture light "$dir/scan.ansi";  variants "$dir/scan.ansi" "$dir/scan-short.ansi" "$dir/scan-hero.ansi"
cmd="lysosome scan ~/code ~/.worktrees --no-system"; title="example output · synthetic demo"
for t in dark light; do
  if [ $t = dark ]; then src="$here"; else src="$dir"; fi
  node "$here/../scripts/ansi-to-svg.mjs" "$src/scan.ansi" "$here/scan-full-$t.svg" --cmd "$cmd" --title "$title" --theme $t
  node "$here/../scripts/ansi-to-svg.mjs" "$src/scan-short.ansi" "$here/scan-$t.svg" --cmd "$cmd" --title "$title" --theme $t
  node "$here/../scripts/ansi-to-svg.mjs" "$src/scan-hero.ansi" "$here/scan-hero-$t.svg" --cmd "$cmd" --title "$title" --theme $t
done
