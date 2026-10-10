#!/usr/bin/env bash
# Rebuild the terminal art from real `lysosome scan` output on a synthetic demo tree.
#   terminal/render.sh <path-to-lysosome-binary> <empty-scratch-dir>
# Needs macOS (APFS clones keep the ~14 GB demo tree at ~70 MB of real disk) and script(1).
# The scratch dir path is rewritten to /Users/dev so no real path is ever published.
set -euo pipefail
bin="$1"; dir="$2"; here="$(cd "$(dirname "$0")" && pwd)"
H="$dir/home"
"$here/make-demo-tree.sh" "$H"
( cd "$H" && env HOME="$H" script -q "$dir/scan.raw" sh -c "\"$bin\" scan \"$H/code\" \"$H/.worktrees\" --no-system 2>/dev/null" >/dev/null )
LC_ALL=C perl -pe "s#\Q$H\E#/Users/dev#g; s/\r\$//; s/[\x04\x08]//g" "$dir/scan.raw" | perl -0pe 's/\A\^D\n?//; s/\^D\s*\z/\n/' > "$here/scan.ansi"
# short version for READMEs: drop the copy-paste cleanup commands block
awk '/Suggested cleanup/{skip=1} skip&&/Removing a worktree keeps/{skip=0; getline; next} !skip' "$here/scan.ansi" > "$here/scan-short.ansi"
cmd="lysosome scan ~/code ~/.worktrees --no-system"; title="example output · synthetic demo"
for t in dark light; do
  node "$here/../scripts/ansi-to-svg.mjs" "$here/scan.ansi" "$here/scan-full-$t.svg" --cmd "$cmd" --title "$title" --theme $t
  node "$here/../scripts/ansi-to-svg.mjs" "$here/scan-short.ansi" "$here/scan-$t.svg" --cmd "$cmd" --title "$title" --theme $t
done
