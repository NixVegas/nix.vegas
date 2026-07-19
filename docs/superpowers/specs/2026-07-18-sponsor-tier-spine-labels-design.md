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

- **HTML tier wrappers** (revised 2026-07-18): each tier in
  `content/2026/_index.md` is wrapped in `<div class="sponsor-tier">` around
  its `###` heading and logo blockquote. The original "pure CSS on existing
  markup" choice used a fixed-height floated label; stress-testing multi-line
  logo rows showed a float cannot vertically center against a sibling of
  dynamic height, so the user opted into the wrappers.
- **Spine direction:** left side, reading bottom-to-top, via
  `writing-mode: vertical-rl` + `transform: rotate(180deg)` (universal support;
  avoids the newer `sideways-lr`).
- **Per-tier accents**, keyed to the heading ids Zola generates from the tier
  names (robust to reordering): `#closure-tier` pink `#e0287d`,
  `#builder-tier` cyan `#66ccee`, `#source-tier` green `#33d17a` (reserved for
  a future Source Tier sponsor).
- **Scoping:** all tier styling lives under `.sponsor-tier`, which only exists
  in the 2026 markup; the shared `#sponsors ~ …` rules revert to serving the
  2025 archive's wrapper-less blockquotes.

## CSS behavior (`sass/components/sponsors.scss`)

- `.sponsor-tier`: `display: flex; align-items: center` — the rotated label
  vertically centers against the logo row at any row height (including
  multi-line wraps); `margin-bottom: 2.5rem` keeps consecutive tiers' rules
  from merging.
- `.sponsor-tier h3`: rotated spine label, `uppercase`, letter-spaced, muted
  gray (`#9aa0a6`).
- `.sponsor-tier blockquote`: `flex: 1`, with the tier-colored `border-left`
  rule — living on the row, it always spans the row's real height; the inner
  `p` is the wrapping flex row of logos (200px wide, 20px margins).
- **Mobile (existing ≤700px breakpoint):** `.sponsor-tier` stacks; the label
  reverts to a horizontal centered heading with a tier-colored underline above
  the logo column; the row rule is dropped as redundant.

## Verification

- `nix develop --command zola build` clean.
- Headless-Chromium screenshots of `/2026/` at desktop and ≤700px widths:
  spines read bottom-up, rows aligned, mobile label horizontal.
- Screenshot of `/2025/` confirming the archive is visually unchanged.
- User confirms on the live preview.
