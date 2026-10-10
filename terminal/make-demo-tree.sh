#!/bin/bash
# Builds a synthetic home folder for the lysosome terminal demo. APFS clones keep real disk use tiny.
set -e
D="$1"; rm -rf "$D"; mkdir -p "$D/code" "$D/.blobs"
B="$D/.blobs"
dd if=/dev/urandom of=$B/m64 bs=1m count=64 2>/dev/null
dd if=/dev/urandom of=$B/m8 bs=1m count=8 2>/dev/null
export GIT_CONFIG_GLOBAL=/dev/null GIT_AUTHOR_NAME=demo GIT_AUTHOR_EMAIL=demo@example.com GIT_COMMITTER_NAME=demo GIT_COMMITTER_EMAIL=demo@example.com
fill() { # dir n64 n8
  mkdir -p "$1"; local i; for ((i=0;i<$2;i++)); do cp -c $B/m64 "$1/c$i.bin"; done; for ((i=0;i<$3;i++)); do cp -c $B/m8 "$1/s$i.bin"; done; }
age() { # path days
  local t=$(date -v-"$2"d +%Y%m%d%H%M); find "$1" -exec touch -h -t $t {} + ; }
mkrepo() { # name days ignore...
  local r="$D/code/$1"; mkdir -p "$r"; cd "$r"; git init -q -b main; shift; local days=$1; shift
  printf '%s\n' "$@" > .gitignore; echo "# demo" > README.md; git add -A
  local dt=$(date -v-"$days"d +%Y-%m-%dT10:00:00)
  GIT_AUTHOR_DATE=$dt GIT_COMMITTER_DATE=$dt git commit -qm init; }
wt() { # repo branch path days dirty(0/1) merged(0/1)
  cd "$D/code/$1"; local dt=$(date -v-"$4"d +%Y-%m-%dT10:00:00)
  git worktree add -q -b "$2" "$3" main
  cd "$3"; if [ "$6" = 0 ]; then echo "$2" > notes.md; git add notes.md; GIT_AUTHOR_DATE=$dt GIT_COMMITTER_DATE=$dt git commit -qm "wip $2"; fi
  if [ "$5" = 1 ]; then echo "uncommitted" >> README.md; fi
}
# projects
mkrepo shop-web 95 node_modules .next dist; fill "$D/code/shop-web/node_modules" 14 9; fill "$D/code/shop-web/.next" 4 5
mkrepo api-server 61 target; fill "$D/code/api-server/target" 38 4
mkrepo ml-notebooks 140 .venv; fill "$D/code/ml-notebooks/.venv" 22 3
mkrepo ios-app 48 Pods build; fill "$D/code/ios-app/Pods" 6 7; fill "$D/code/ios-app/build" 9 0
mkrepo docs-site 3 node_modules; fill "$D/code/docs-site/node_modules" 5 2
# agent worktrees
W="$D/.worktrees"
wt shop-web agent/checkout-v2 "$W/shop-web/checkout-v2" 52 0 1; fill "$W/shop-web/checkout-v2/node_modules" 14 9
wt shop-web agent/fix-cart-rounding "$W/shop-web/fix-cart-rounding" 44 0 1; fill "$W/shop-web/fix-cart-rounding/node_modules" 13 4
wt shop-web agent/spike-auth "$W/shop-web/spike-auth" 70 1 0; fill "$W/shop-web/spike-auth/node_modules" 12 2
wt api-server agent/rate-limits "$W/api-server/rate-limits" 39 0 1; fill "$W/api-server/rate-limits/target" 27 3
wt api-server agent/otel-traces "$W/api-server/otel-traces" 66 0 0; fill "$W/api-server/otel-traces/target" 31 0
wt api-server claude/refactor-db "$D/code/api-server/.claude/worktrees/refactor-db" 35 0 1; fill "$D/code/api-server/.claude/worktrees/refactor-db/target" 18 6
# make everything old except docs-site
for p in shop-web api-server ml-notebooks ios-app; do :; done
age "$D/code/shop-web" 95; age "$D/code/api-server" 61; age "$D/code/ml-notebooks" 140; age "$D/code/ios-app" 48; age "$D/code/docs-site" 3
age "$W/shop-web/checkout-v2" 52; age "$W/shop-web/fix-cart-rounding" 44; age "$W/shop-web/spike-auth" 70
age "$W/api-server/rate-limits" 39; age "$W/api-server/otel-traces" 66; age "$D/code/api-server/.claude/worktrees/refactor-db" 35
for w in checkout-v2:52 fix-cart-rounding:44 spike-auth:70; do age "$D/code/shop-web/.git/worktrees/${w%%:*}" ${w##*:}; done
for w in rate-limits:39 otel-traces:66 refactor-db:35; do age "$D/code/api-server/.git/worktrees/${w%%:*}" ${w##*:}; done
rm -rf "$B"
echo done; du -sh "$D"
