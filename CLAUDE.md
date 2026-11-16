# lysosome brand

Public brand package for [lysosome](https://lysosome.dev), the disk cleaner for the agentic coding era: logo, design tokens, social art, terminal art and guidelines. Assets are CC BY 4.0, scripts are MIT. Read `BRAND.md` before changing anything visual.

## Commands
- `scripts/verify`: the CI check (tokens.css must match tokens.json). Run before every PR.
- `npm run tokens`: regenerate `tokens/tokens.css` from `tokens/tokens.json`.
- `npm run logo`: rebuild logo SVG/PNG (needs python3).
- `npm run render`: render social images (Playwright).

## Layout
- `tokens/`: `tokens.json` (source of truth) and generated `tokens.css`.
- `logo/`: SVG and PNG logo files.
- `social/`: social card art. `terminal/`: terminal art.
- `fonts/`, `design/`: font files and design sources.
- `scripts/`: build and render scripts.
- `BRAND.md`: usage guidelines.

## Deploy & release
Nothing is deployed from here. Changes land via PR to `main` (squash merge); the `tokens` workflow runs `scripts/verify`. Consumers vendor `tokens.css` themselves.

## Rules
- Edit `tokens.json`, never `tokens.css` by hand; rerun `npm run tokens`.
- This repo is public: never reference non-public repos, secrets or infrastructure.
- Never commit directly to `main`. Use `feature/`, `fix/`, `chore/` or `docs/` branches.
- Keep SVGs text-outlined (no web fonts).

## Docs
- [BRAND.md](BRAND.md), [README.md](README.md)
