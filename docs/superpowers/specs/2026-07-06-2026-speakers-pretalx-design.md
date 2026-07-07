# 2026 Speakers — client-side pretalx renderer, card grid

- **Date:** 2026-07-06
- **Route:** `https://nix.vegas/2026/speakers/`
- **Status:** Design approved; ready for implementation plan.

## Background

The 2026 schedule page (see `2026-06-23-2026-schedule-pretalx-design.md`) established the
pattern this design follows: per-CFP-tool templates selected by filename, a client-side
fetch from pretalx on page load, progressive enhancement (loading / empty / error /
`<noscript>` states), vanilla JS with strict DOM-building rules, and a namespaced sass
partial.

The speakers page is still on the 2025 path: `templates/speakers.html` renders the
Sessionize-shaped `data/<year>/speakers-filtered.json` server-side at build time.
`data/2026/speakers-filtered.json` is an empty `[]`, so `/2026/speakers/` shows the
"Coming soon" state today.

**2026 uses pretalx.** Its speakers API has a different shape than Sessionize and is
already serving accepted speakers.

## Verified against the live instance (2026-07-06)

- `https://cfp.nix.vegas/api/events/2026/speakers/` — public, `200`,
  `access-control-allow-origin: *`, `allow: GET, HEAD, OPTIONS`. Paginated envelope
  `{count, next, previous, results}` (currently `count: 6`, `next: null`). Speaker fields
  used: `code`, `name`, `biography` (nullable), `avatar_url` (nullable, `cfp.nix.vegas`
  media URL), `submissions` (array of submission codes).
- `https://cfp.nix.vegas/2026/schedule/export/schedule.json` — the export the schedule
  page already fetches; talks carry `code`, `title`, `url`, so it doubles as the
  submission-code → talk lookup.
- `https://cfp.nix.vegas/2026/speaker/<code>/` — public speaker profile page, `200`.
- `https://cfp.nix.vegas/2026/speaker/` — public speaker list page, `200` (fallback link
  target).

## Goals

1. Render the live 2026 speakers on `/2026/speakers/` by fetching the pretalx speakers API
   **in the browser on page load** (always current; no build step, no commit, no CI).
2. New **card grid** layout (responsive, dark / on-brand, matching the 2026 schedule's
   card aesthetic) replacing the 2025 one-speaker-per-row list for 2026 onward.
3. Make speaker templates **per CFP tool**, so each year picks its renderer by filename.
   Leave the 2025 archive byte-for-byte identical in output.

## Key Decisions & Rationale

### D1 — Client-side fetch on page load (chosen by user)
Consistent with the schedule page's D1. Always current as talks are accepted; no
build-time network (Netlify `zola build` and the Nix sandbox stay network-free).
Tradeoffs accepted: needs JS, needs `cfp.nix.vegas` reachable at view time. Mitigation:
progressive enhancement (see States).

### D2 — Card grid layout (chosen by user)
Responsive grid of speaker cards. Compact, scales as more speakers are accepted, and
visually consistent with the schedule's card design.

### D3 — Join talks from the schedule export (chosen by user)
The speakers API only gives submission *codes*. Fetch the schedule export **in parallel**
and map `code → {title, url}` to show each speaker's scheduled talks. A submission not on
the schedule contributes no talk row. If the schedule fetch fails but the speakers fetch
succeeds, render cards without talk rows (degrade, don't error).

### D4 — Per-CFP-tool templates (rename existing)
- `templates/speakers.html` → **`templates/speakers-sessionize.html`** (`git mv`,
  contents unchanged).
- New **`templates/speakers-pretalx.html`** — the client-side shell.
- No conditional logic inside either template; the year selects the tool by filename.

## Architecture / Components

| File | Change |
|---|---|
| `templates/speakers.html` → `templates/speakers-sessionize.html` | `git mv`, contents unchanged |
| `templates/speakers-pretalx.html` | **New.** Client-side shell (markup + states + script tag) |
| `static/js/speakers.js` | **New.** Vanilla JS (single deferred classic script): fetch → join → render |
| `sass/components/speakers-pretalx.scss` | **New.** Card-grid styles, namespaced; `@import`ed in `sass/style.scss` |
| `content/2026/speakers.md` | `template: "speakers-pretalx.html"` |
| `content/2025/speakers.md` | `template: "speakers-sessionize.html"` (one line; identical render) |
| `script/year-template/speakers.md` | Default scaffold to `speakers-pretalx.html` (current tool) |

### `templates/speakers-pretalx.html` (shell)
- Renders `{{ page.content | safe }}` and page header (parity with the current template).
- Derives the year via the existing `year_macros::year_of_page(page=page)` macro.
- Emits a single container with `data-*` attributes consumed by JS:
  - `data-speakers-url="https://cfp.nix.vegas/api/events/<year>/speakers/"`
  - `data-schedule-url="https://cfp.nix.vegas/<year>/schedule/export/schedule.json"`
  - `data-public-url="https://cfp.nix.vegas/<year>/speaker/"` (fallback link)
- Contains the **loading**, **empty**, **error**, and `<noscript>` markup (see States).
- Loads `<script defer src="/js/speakers.js"></script>` (the only script on the page).

### `static/js/speakers.js`
Vanilla JS, no dependencies, single classic script loaded with `defer` (consistent with
`schedule.js`). Responsibilities:
1. Fetch the speakers API and the schedule export in parallel.
2. Speakers API pagination: follow `next` links until `null`, with a hard cap of 10 pages
   as a runaway guard (the page renders what was fetched if the cap is ever hit).
3. Build `code → {title, url}` from the export
   (`.schedule.conference.days[].rooms{}[]` talks).
4. Sort speakers by `name`, case-insensitive.
5. Render the card grid. DOM via `createElement` / `textContent` only.

## Rendering Spec (card grid)

- **Grid:** CSS grid, `auto-fill` columns with a ~260px minimum card width; collapses to
  one column on narrow viewports.
- **Card contents,** top to bottom:
  - **Avatar** — `avatar_url` when present (subject to the Security URL rule); otherwise
    a generated placeholder: a circle in the pink brand accent (`#e0287d`) containing the
    speaker's first letter (DOM + CSS, no image asset).
  - **Name** — links to `https://cfp.nix.vegas/<year>/speaker/<code>/` (the full-bio
    destination), `rel="noopener"`.
  - **Bio** — plain text, clamped to 4 lines (CSS line clamp). When `biography` is null
    or empty/whitespace, the bio row is omitted. No other content filtering: what the
    speaker wrote is what renders.
  - **Talks** — one row per scheduled talk: title linking to the talk's pretalx page
    (`url` from the export), `rel="noopener"`. Speakers with no scheduled talks simply
    have no talk rows.

## States (progressive enhancement, parity with the schedule page)

- **Loading** — "Loading speakers…" placeholder until the fetches resolve.
- **Empty** — API returns zero speakers → the same "Coming soon" treatment the page has
  today.
- **Error** — speakers fetch fails → friendly message + link to
  `data-public-url` (`https://cfp.nix.vegas/<year>/speaker/`).
- **Partial** — schedule fetch fails, speakers succeeds → cards render without talk rows.
- **No-JS** — `<noscript>` block with the same public speaker-list link.

## Security

- DOM built exclusively via `createElement` / `textContent` — **never** `innerHTML` with
  fetched strings. Bios render as plain text.
- All outbound links `rel="noopener"`.
- `href` / `src` values from fetched data render only when they are
  `https://cfp.nix.vegas/…` URLs (avatar images, talk links); profile links are
  constructed from the year and the speaker `code`.
- `fetch()` is credential-less, consistent with `Access-Control-Allow-Origin: *`.

## Non-Goals (YAGNI)

- No markdown/HTML rendering of bios (plain text only).
- No search, filtering, or sorting UI.
- No speaker detail pages on nix.vegas (pretalx profiles serve that).
- No changes to `script/refresh-data.sh` or the Sessionize/2025 render path.
- No caching/snapshot layer.

## Verification Plan

1. `zola serve` → `/2026/speakers/`: one card per API speaker (currently 6), sorted
   alphabetically; avatars show for
   speakers that have them, placeholders for the rest; the long bio (JB) clamps; talk
   titles link to their pretalx pages.
2. `/2025/speakers/` renders byte-for-byte identical (server-side path unchanged).
3. Temporarily point `data-speakers-url` at a bad host → error state + fallback link.
4. Temporarily point only `data-schedule-url` at a bad host → cards render without talk
   rows.
5. `zola build` succeeds (no build-time network introduced).
6. Narrow viewport: grid collapses to one column cleanly.

## Open Assumptions (confirm at review)

- pretalx host/path patterns `cfp.nix.vegas/api/events/<year>/…` and
  `cfp.nix.vegas/<year>/speaker/…` (URLs derived from the year, like the schedule shell).
- The speakers API lists accepted speakers ahead of schedule publication (it does today);
  if pretalx ever hides them until release, the page falls back to "Coming soon".
- New-year scaffold defaults future years to `speakers-pretalx.html`.
