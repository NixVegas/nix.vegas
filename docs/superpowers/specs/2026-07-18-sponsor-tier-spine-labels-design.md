# Sponsor tier spine labels (2026)

- **Date:** 2026-07-18
- **Branch:** `djacu/update-2026-sponsors` (lands after the NixOS/Exa + logo-sizing commits)
- **Status:** Design approved.

## Goal

On the 2026 home page, render each sponsor tier heading (`### Closure Tier`,
`### Builder Tier`) as a vertical "book spine" label: rotated 90°, reading
bottom-to-top, sitting inline at the left edge of its logo row, with a thin pink
rule between label and logos.

## Decisions

- **Pure CSS on the existing markup** (user-chosen over HTML wrappers):
  `content/2026/_index.md` is untouched; all changes live in
  `sass/components/sponsors.scss`.
- **Spine direction:** left side, reading bottom-to-top, via
  `writing-mode: vertical-rl` + `transform: rotate(180deg)` (universal support;
  avoids the newer `sideways-lr`).
- **Scoping:** `#sponsors ~ h3` matches nothing on the 2025 archive (it has no
  `###` headings) and intentionally applies to future years that copy the tier
  pattern. Two inert rules do reach 2025: `min-height` on the logo rows (equals
  their natural height) and `clear: both` on trailing paragraphs (no floats
  there). This branch already restyles the shared logo rules, so that is within
  precedent.

## CSS behavior

- `#sponsors ~ h3`: `float: left; clear: left;` fixed `height: 230px` (150px
  logo + 2×40px margins — tracks the logo rules above it); text centered along
  the spine; `text-transform: uppercase`, letter-spacing, muted gray (`#9aa0a6`);
  pink (`#e0287d`) rule + padding on the side facing the logos.
- `#sponsors ~ blockquote`: `min-height: 230px` so every row is at least
  label-height; the flex logo row sits beside the float without overlap (flex
  roots establish a new formatting context).
- `#sponsors ~ p`: `clear: both` so following copy never wraps around a label.
- **Mobile (existing ≤700px breakpoint):** label reverts to a horizontal
  centered heading above the stacked logo column (float/rotation undone, same
  uppercase/accent styling).

## Verification

- `nix develop --command zola build` clean.
- Headless-Chromium screenshots of `/2026/` at desktop and ≤700px widths:
  spines read bottom-up, rows aligned, mobile label horizontal.
- Screenshot of `/2025/` confirming the archive is visually unchanged.
- User confirms on the live preview.
