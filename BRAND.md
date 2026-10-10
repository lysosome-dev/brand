# lysosome brand guidelines

How lysosome looks, sounds and names things. The source of truth for colors and type is
[`tokens/tokens.json`](tokens/tokens.json). Everything here was taken from the live site,
[lysosome.dev](https://lysosome.dev), not invented on top of it.

- [Story](#story)
- [Voice and tone](#voice-and-tone)
- [Naming](#naming)
- [Logo](#logo)
- [Color](#color)
- [Typography](#typography)
- [Imagery](#imagery)
- [Copy blocks](#copy-blocks)
- [Using the tokens in other repos](#using-the-tokens-in-other-repos)

## Story

A lysosome is the cell's recycling organelle. It takes in what the cell no longer needs,
breaks it down and returns the useful parts. It doesn't touch working machinery.

The product does the same job on a developer's disk. Coding agents create git worktrees
all the time and nothing cleans them up. Each one drags its own `node_modules`, `target`
or `.venv`. Add build output, package caches, local AI models, Docker and Xcode data, and
the SSD fills up. lysosome finds that material, labels every item by how safe it is to
remove, and reclaims it carefully.

The visual language comes from **fluorescence microscopy**. The page is a dark slide, the
organelle is drawn in LysoTracker red, and each safety tier has its own stain: GFP mint,
amber and DAPI blue. Color in lysosome carries meaning. It is never decoration.

## Voice and tone

**Technical, calm, trustworthy, a little witty.** Write like the senior engineer who
already checked: specific about what was found, what will happen and what won't.

| Do | Don't |
|----|-------|
| State facts with numbers: "6 dormant worktrees are holding 7.9 GB." | Use alarm: "Your disk is DYING!", "Critical storage emergency" |
| Explain the safety rule: "Dry run by default. Files go to the Trash." | Promise magic: "Instantly free up 100 GB!" |
| Name things by what the user recognizes: worktrees, `node_modules`, models | Use internal names: detectors, findings pipeline |
| Use one dry line of wit when it earns its place: "Digest what your agents leave behind." | Stack puns or biology jokes; one metaphor per page is enough |
| Say "a human should look first" for REVIEW items | Call anything "junk", "garbage" or "bloat". It was useful once. |
| Use sentence case, plain verbs, active voice | Use Title Case Headlines or exclamation marks |

A full disk is an ordinary problem, not a crisis. Never use fear to sell. Being careful is
the product, so the copy should be careful too: say what was checked, what is skipped and
how to undo it.

## Naming

- The product is **lysosome**, always lowercase, including at the start of a sentence
  ("lysosome finds…") and in titles. Never "Lysosome", "LYSOSOME" or "LysoSome".
- The command is `lysosome` in code formatting when you mean the binary: `lysosome scan`.
- The site and organization are **lysosome.dev**. The GitHub org is `lysosome-dev`.
- The products are "the lysosome CLI" (open source, MIT) and "the lysosome Mac app"
  (paid, coming soon). Don't invent sub-brands.
- Tier names: write **regenerable**, **expensive** (or "regenerable_expensive" when you
  mean the JSON value) and **review**. Status names in output are uppercase: `REMOVABLE`,
  `REVIEW`, `ACTIVE`, `ORPHAN`.

## Logo

The mark is the organelle: an irregular membrane in stain red holding three vesicles, one
per safety tier (mint = regenerable, amber = expensive, blue = review). The wordmark is
"lysosome" set in Bricolage Grotesque 650 at 88% width with -0.03em tracking, converted to
outlines so it never depends on a font being installed.

| Asset | For dark backgrounds | For light backgrounds | One color |
|-------|----------------------|-----------------------|-----------|
| Mark | `logo/svg/mark-on-dark.svg` | `logo/svg/mark-on-light.svg` | `mark-mono-black.svg`, `mark-mono-white.svg` |
| Mark, solid badge (favicons, tiny sizes, any background) | `logo/svg/mark-solid.svg` | same | |
| Wordmark | `wordmark-on-dark.svg` | `wordmark-on-light.svg` | `wordmark-mono-*.svg` |
| Horizontal lockup (default) | `lockup-horizontal-on-dark.svg` | `lockup-horizontal-on-light.svg` | `lockup-horizontal-mono-*.svg` |
| Stacked lockup | `lockup-stacked-on-dark.svg` | `lockup-stacked-on-light.svg` | `lockup-stacked-mono-*.svg` |
| Avatar (square, full bleed, safe for a circle crop) | `logo/svg/avatar.svg`, `logo/png/avatar-500.png`, `avatar-1024.png` | | |

PNG exports of every SVG are in `logo/png/`: marks at 16 to 1024 px, lockups and
wordmarks at 400, 800 and 1600 px wide.

**Clear space.** Keep empty space around the logo of at least the height of the
wordmark's lowercase "o" (the x-height). For the mark alone, keep at least 25% of the
mark's width on every side.

**Minimum size.** Mark: 16 px; below 24 px use `mark-solid`, which has an opaque body and
a heavier membrane. Horizontal lockup: 96 px wide. Stacked lockup: 64 px wide.

**Do**

- Use the `on-dark` files on dark backgrounds and the `on-light` files on light ones.
- Use the one-color versions where color isn't available (embossing, single-ink print,
  monochrome UI) or when it would clash.
- Keep the three vesicle colors in their positions. They are the tier legend in miniature.

**Don't**

- Recolor the membrane, swap the vesicle colors, or add or remove vesicles.
- Stretch, rotate, outline, add drop shadows or put the mark in a different container
  shape. The avatar's soft glow is the only effect, and it lives only in the avatar.
- Retype the wordmark in another font, capitalize it, or change its spacing.
- Place the full-color logo on busy photos or on the stain red itself.
- Use the logo in a way that implies lysosome.dev endorses something it doesn't (see
  [LICENSE](LICENSE)).

## Color

Dark is the default theme. Light mode follows the system unless a page pins one.

### Surfaces and text

| Token | Dark | Light | Use |
|-------|------|-------|-----|
| `color.bg` | `#110d1a` | `#f6f3fa` | Page background (the slide) |
| `color.bg-deep` | `#0b0812` | `#ece6f3` | Recessed areas, terminal background |
| `color.surface` | `#1a1526` | `#ffffff` | Cards, inputs |
| `color.surface-2` | `#221b31` | `#f3eef9` | Raised surfaces, inline code |
| `color.line` | `#2e2643` | `#e1d9ec` | Borders, hairlines |
| `color.ink` | `#eee8f7` | `#1b1426` | Primary text |
| `color.muted` | `#a99fbd` | `#5f5573` | Secondary text |
| `color.faint` | `#6f6585` | `#8d84a0` | Captions, labels; not for body text |

### Brand stain

| Token | Dark | Light | Use |
|-------|------|-------|-----|
| `color.stain` | `#ff4d7e` | `#d11d54` | The organelle. Primary buttons, links, focus rings, the membrane |
| `color.stain-ink` | `#1a0610` | `#ffffff` | Text on a stain fill |

Use stain red sparingly: one primary action per view, links and focus. It means
"lysosome" and "act here". It never means danger or error.

### Safety tiers

Every item lysosome reports has exactly one tier. When a tier appears in UI, docs or
marketing, it uses its stain and nothing else uses that stain.

| Tier | Token | Dark | Light | Meaning |
|------|-------|------|-------|---------|
| regenerable | `color.tier.regenerable` | `#6ef0b0` GFP mint | `#0b8a57` | Cheap to rebuild: build output, caches, clean merged worktrees |
| expensive (`regenerable_expensive`) | `color.tier.expensive` | `#ffc15e` amber | `#a35f00` | Costly to get back: dependencies to re-download, AI models, images |
| review | `color.tier.review` | `#92a9ff` DAPI blue-violet | `#3a57d1` | A human should look first: dirty or unpushed worktrees, volumes, archives |

Rules:

- Never use a tier color for decoration, and never use red for a tier. A REVIEW item isn't
  dangerous. It needs a look.
- Pair color with a word or an icon (`REMOVABLE`, `REVIEW`, a filled or outlined dot). Color
  is never the only signal.
- Glow (`glow`: 0.55 dark, 0.2 light) belongs to fluorescent elements only: the membrane,
  tier chips, the primary button. Body text never glows.
- Contrast on each theme's `bg`: ink, muted, stain and all dark-theme tier colors pass WCAG
  AA for body text (4.5:1 or more). Two pass only the 3:1 large-text and UI level: `faint`
  (3.5:1 dark, 3.2:1 light), for captions and labels only, and light-theme regenerable
  `#0b8a57` (4.0:1), for chips, dots and bold labels, not paragraphs.

> Terminal note: the CLI's ANSI output currently colors `regenerable_expensive` cyan and
> `review` yellow, so it doesn't yet match the brand mapping above. Terminal art in this repo
> shows the real output as-is.

## Typography

All three families are variable, self-hosted and licensed under the SIL OFL 1.1. The files
are in [`fonts/`](fonts/) with [`fonts/OFL.txt`](fonts/OFL.txt). Load them with
[`fonts/fonts.css`](fonts/fonts.css).

| Role | Family | Settings | Use |
|------|--------|----------|-----|
| Display | **Bricolage Grotesque** | 700, width 82%, -0.028em, line-height 0.98, optical sizing auto | Headlines |
| Wordmark and titles | Bricolage Grotesque | 650, width 88%, -0.03em | Wordmark, card titles, table heads |
| Body | **Instrument Sans** | 400 / 600, line-height 1.6 | Paragraphs, UI, buttons |
| Mono | **JetBrains Mono** | 400–600 | Commands, paths, sizes, eyebrows (lowercase, +0.04em) |

Scale (rem): display 5.6 (fluid from 2.7) · h2 3.3 (fluid from 2) · h3 1.45 · wordmark 1.32 ·
lede 1.2 · body 1.0625 · small 0.9 · eyebrow 0.78 · fine 0.74.

Use the display face only for short headlines. Everything you can type in a terminal (a
command, a path, a size) goes in mono.

## Imagery

- **The slide.** A dark round microscope field with the membrane glowing in stain red and
  tier-colored chips (paths like `node_modules`, `wt/checkout-v2`, `llama3.1:70b`) drifting
  around it. This is the hero image everywhere: see `design/social.html`.
- **Real output.** Terminal art is real `lysosome scan` output from a synthetic demo tree
  (`terminal/render.sh`), labeled "example output". Never publish someone's real paths, and
  never invent numbers you present as real results.
- No stock photos, no 3D cells, no trash cans or bins. The metaphor is digestion and
  recycling, not destruction.

## Copy blocks

Use these as they are, or trim them. Don't add claims they don't make.

**Tagline:** The disk cleaner for the agentic coding era.

**Hero line:** Digest what your agents leave behind.

**One-liners**

- Find and safely reclaim the disk your dev tools and coding agents leave behind.
- Dormant worktrees, build output, caches, AI models. Found, labeled, reclaimed safely.
- See where the space went before anything is deleted.

**Short description (≈ 160 characters)**

> lysosome finds the dormant git worktrees, build artifacts, caches and AI models filling
> your SSD, labels each by how safe it is to remove, and cleans up carefully.

**Long description**

> Coding agents like Claude Code and Cursor create git worktrees constantly, and nothing
> cleans them up. Each dormant worktree drags its own `node_modules`, `target` or `.venv`.
> Add build artifacts, package caches, local AI models, Docker and Xcode data, and a dev
> machine's SSD fills up fast.
>
> lysosome shows where the disk went and labels every item by how safe it is to delete:
> regenerable, expensive to get back, or worth a human look. Cleaning is a dry run by
> default, uses the Trash or each tool's own cleanup command, and re-checks every item right
> before touching it. It never removes a worktree with uncommitted, untracked or unpushed
> work. The open-source CLI runs on macOS and Linux; a native Mac menu bar app is coming soon.

**Boilerplate**

> lysosome is the disk cleaner for the agentic coding era. The open-source lysosome CLI
> (MIT, written in Rust) finds and safely reclaims disk used by dormant git worktrees, build
> artifacts, package caches, local AI models, Docker and Xcode. A paid lysosome Mac app is in
> development. Learn more at lysosome.dev.

**Install line:** `brew install lysosome-dev/tap/lysosome`

## Using the tokens in other repos

`tokens/tokens.json` is the source. `tokens/tokens.css` is generated from it
(`node scripts/build-tokens.mjs`; CI checks it's current with `--check`). Every token becomes
a `--ly-*` custom property, with the light theme applied under
`prefers-color-scheme: light` unless `<html data-theme="dark|light">` pins one:

```css
--ly-color-bg  --ly-color-stain  --ly-color-tier-regenerable  --ly-color-tier-expensive
--ly-color-tier-review  --ly-glow  --ly-font-family-display  --ly-radius-md  ...
```

**Websites (lysosome.dev).** Vendor the file at a pinned brand commit and map local names
to it, so the brand can change in one place:

```css
@import url("/brand/tokens.css");
:root { --bg: var(--ly-color-bg); --stain: var(--ly-color-stain); /* … */ }
```

The platform repo does this with `scripts/sync-brand.mjs`, which copies `tokens/tokens.css`
from a sibling `../brand` checkout or downloads it from a pinned commit.

**READMEs.** Reference images through raw URLs pinned to a commit or `main`, with
`<picture>` for dark and light:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/lysosome-dev/brand/main/logo/svg/lockup-horizontal-on-dark.svg">
  <img alt="lysosome" src="https://raw.githubusercontent.com/lysosome-dev/brand/main/logo/svg/lockup-horizontal-on-light.svg" width="260">
</picture>
```

**Native code (the Mac app, the CLI).** Read `tokens.json` directly. Colors are hex strings
under `$value` (dark) and `$extensions["dev.lysosome.modes"].light`.
