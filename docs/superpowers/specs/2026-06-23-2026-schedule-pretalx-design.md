# 2026 Schedule — client-side pretalx renderer + per-CFP-tool templates

- **Date:** 2026-06-23
- **Route:** `https://nix.vegas/2026/schedule/`
- **Status:** Design approved (visual layout chosen via brainstorming companion); ready for implementation plan.

## Background

The site is a **Zola** static site. Each event year lives under `content/<year>/`, and each
`content/<year>/schedule.md` selects a renderer via its `template:` front-matter field.

- **2025** used **Sessionize**. `script/refresh-data.sh` fetched the Sessionize `GridSmart`
  view, committed it to `data/2025/schedule.json`, and `templates/schedule.html` rendered it
  **server-side at build time** via Zola's `load_data`.
- Both build paths build from committed data and do **no** network I/O: Netlify runs
  `zola build` (per `netlify.toml`), and the Nix derivation (`pkgs/nix-vegas-site`) runs
  `zola build` in a sandbox (no network available).
- The site currently ships **zero JavaScript** — no `<script>` tags in templates, no `.js`
  files. `templates/base.html` loads only `/style.css`.

**2026 uses pretalx.** Its schedule export
(`https://cfp.nix.vegas/2026/schedule/export/schedule.json`) has a fundamentally different
shape than Sessionize (see Data Transform). We will render it **client-side** and adopt a new,
better-looking layout (we are not bound to the 2025 design).

## Goals

1. Render the live 2026 schedule on `/2026/schedule/` by fetching the pretalx export **in the
   browser on page load** (always current; no build step, no commit, no CI).
2. Introduce a new **"day tabs + cards"** layout (direction B), dark / on-brand.
3. Make schedule templates **per CFP tool**, so each year picks its renderer by filename. Leave
   the 2025 archive byte-for-byte identical in output.

## Key Decisions & Rationale

### D1 — Client-side fetch on page load (chosen by user)
The browser fetches `schedule.json` from pretalx and renders with JS on every view.

- **Verified dependency — CORS:** the endpoint returns `access-control-allow-origin: *`
  (confirmed on both `GET` and `OPTIONS`; `allow: GET, HEAD, OPTIONS`, `content-type:
  application/json`). A credential-less `fetch()` from `nix.vegas` works.
- **Tradeoffs accepted:** first JS on the site; schedule not in git / not crawlable / not
  server-rendered; depends on `cfp.nix.vegas` being reachable at view time.
- **Mitigation:** progressive enhancement — `<noscript>` + an error state, both linking to the
  hosted pretalx schedule, so the tab is never a dead end.

### D2 — Per-CFP-tool templates (rename existing) (chosen by user)
- `templates/schedule.html` → **`templates/schedule-sessionize.html`** (`git mv`, contents
  unchanged — its hardcoded "Hacker Tracker / DEF CON 33" link is correct for the 2025 archive).
- New **`templates/schedule-pretalx.html`** — the client-side shell.
- The year selects the tool by filename; no conditional logic inside either template.

### D3 — Layout direction B ("day tabs + cards"), with selected extras
Chosen in the visual companion. Optional extras the user enabled: **Live now / Up next
highlight (1)**, **track chips (2)**, **per-card room badge (4)**. Not enabled: full abstracts
inline (3) → abstracts stay **clamped to 2 lines + "Details" link**.

## Architecture / Components

| File | Change |
|---|---|
| `templates/schedule.html` → `templates/schedule-sessionize.html` | `git mv`, contents unchanged |
| `templates/schedule-pretalx.html` | **New.** Client-side shell (markup + states + `<script>`) |
| `static/js/schedule.js` | **New.** Vanilla JS (single deferred classic script): fetch → transform → render → interactions |
| `sass/components/schedule-pretalx.scss` | **New.** Direction-B styles; namespaced; `@import`ed in `sass/style.scss` |
| `content/2026/schedule.md` | `template: "schedule-pretalx.html"` |
| `content/2025/schedule.md` | `template: "schedule-sessionize.html"` (one line; identical render) |
| `script/year-template/schedule.md` | Default scaffold to `schedule-pretalx.html` (current tool) |

### `templates/schedule-pretalx.html` (shell)
- Renders `{{ page.content | safe }}` and the page header (parity with current template).
- Derives the year from the path via the existing `year_macros::year_of_page(page=page)` macro.
- Emits a single container with `data-*` attributes consumed by JS:
  - `data-schedule-url="https://cfp.nix.vegas/<year>/schedule/export/schedule.json"`
  - `data-public-url="https://cfp.nix.vegas/<year>/schedule/"` (fallback link)
  - `data-timezone="{{ config.extra.timezone }}"` (`America/Los_Angeles`)
  - *(Assumption: the `cfp.nix.vegas/<year>/…` host/path pattern. Documented; if it ever
    diverges, switch to a front-matter override.)*
- Contains the **loading**, **empty**, **error**, and `<noscript>` markup (see States).
- Loads `<script src="/js/schedule.js" defer></script>` (the only script on the page).

### `static/js/schedule.js`
Vanilla JS, no dependencies / no bundler / no `import`s — a single classic script loaded with
`defer` so the data-attribute container exists before it runs (consistent with the
no-build-tooling ethos). Responsibilities: fetch the JSON, transform to a view model, render
the day-tabs + cards DOM, wire tab switching, and compute the live/up-next highlight. Builds
DOM via `document.createElement` / `textContent` only.

### `sass/components/schedule-pretalx.scss`
New partial for the B layout, class-namespaced (e.g. all classes under a `.pretalx-schedule`
root or a `psched-` prefix) so it never collides with the 2025 `schedule.scss`. Add
`@import './components/schedule-pretalx.scss';` to `sass/style.scss`.

## Data Transform (pretalx → view model)

Pretalx export shape (verified against the live endpoint):

- `.schedule.conference.days[]` — each `{ index, date:"YYYY-MM-DD", day_start, day_end,
  rooms }`, where **`rooms` is a map** keyed by room name → array of talks.
- Talk: `{ date:"2026-08-07T10:00:00-07:00", start:"HH:MM", duration:"HH:MM", room, title,
  subtitle, track, type, abstract, description (often null), persons:[{public_name, name}],
  url, code, slug }`.
- `.schedule.conference.tracks[]` — `{ name, slug, color }` (e.g. Events `#aa1d1d`).
- `.schedule.conference.time_zone_name` — `America/Los_Angeles`.

| Pretalx | → rendered |
|---|---|
| `days[]` (skip days whose rooms are all empty) | day tabs + day panel |
| **day label** | derived from a **session's `date`** (which carries the `-07:00` offset), formatted in the display TZ. **Do not** use `day.date` (`new Date("2026-08-07")` parses as UTC and renders the previous day in Pacific). |
| `rooms` map (skip empty rooms) | grouped sessions; see room-badge rule below |
| session `date` | **start** instant (`new Date(date)` — correct, offset-bearing) |
| `date` + `duration` ("HH:MM") | **end** = start + duration; both formatted in the display TZ |
| `title` + `url` | card title, linked to the pretalx talk page (`url`) |
| `persons[].public_name` (fallback `name`) | speakers row (omitted when empty) |
| `description \|\| abstract` | card body, clamped to 2 lines + "Details ↗" → `url` |
| `track` + track `color` | track chip (conditional — see below) |
| `room` | per-card room badge (conditional — see below) |

Sessions sorted by start instant; rooms iterated in `conference.rooms` order.

## Rendering Spec (layout B)

- **Tabs:** one per non-empty day, showing weekday + date (e.g. "Thu / Aug 7"); active tab
  underlined in the pink accent (`#e0287d`). Tabs wrap on narrow viewports.
- **Default active day:** the day containing "now" if today (in the display TZ) matches a
  scheduled day; otherwise the first non-empty day.
- **Day meta line:** "<N> sessions · <room(s)> · all times Pacific".
- **Card:** time column (start prominent in cyan `#66ccee`, end muted, duration) + info column
  (title link with ↗, optional track chip, clamped abstract, speakers row when present). The
  **title always links** to the talk page; the **"Details ↗" link appears only when the
  abstract is actually truncated** (matches the mockup — short abstracts show no "Details").
- **Track chip (extra 2):** show only when the rendered sessions span **more than one distinct
  track**; colored by the track's pretalx `color`. (Currently all sessions are "Events" → chip
  hidden. We chip on `track`, not submission `type`; adjustable.)
- **Per-card room badge (extra 4):** show on each card **only when a day has more than one room
  with sessions**; with a single room, show the room once in the day meta line instead.
- **Live / Up next (extra 1):** computed at load using real time. A session whose
  `[start, end)` contains "now" is badged **LIVE**; the earliest future session that day is
  badged **UP NEXT**. Comparisons use absolute instants, so they are correct regardless of the
  viewer's timezone. No periodic auto-refresh (recomputed on reload only).

## States (progressive enhancement)

- **Loading** — "Loading schedule…" placeholder shown until fetch resolves.
- **Empty** — pretalx returns no non-empty days → a "Coming soon" message (parity with the
  current empty state).
- **Error** — fetch/CORS/network failure → friendly message + link to `data-public-url`.
- **No-JS** — `<noscript>` block with the same link to the hosted pretalx schedule.

## Timezone Handling

- **Display:** all times formatted with `Intl.DateTimeFormat` using `timeZone` =
  `config.extra.timezone` (`America/Los_Angeles`), matching the 2025 template's behavior, so
  times read in Pacific regardless of the viewer's locale.
- **Day-label pitfall:** never construct dates from the date-only `day.date`; derive day labels
  from a session's offset-bearing `date`.
- **Comparisons** (live/up-next, default-day): use absolute instants (`Date` objects), not
  wall-clock strings.

## Security

- DOM built exclusively via `createElement` / `textContent` — **never** `innerHTML` with
  fetched strings. Abstracts are rendered as plain text.
- Title links: `<a href>` to the talk `url`, with `rel="noopener"`; only render the link when
  `url` is an `https://cfp.nix.vegas/…` URL.
- `fetch()` is credential-less (default), consistent with `Access-Control-Allow-Origin: *`.

## Non-Goals (YAGNI)

- No markdown/HTML rendering of abstracts (plain text only).
- No full time×room calendar grid; not reviving the dormant `schedule-as-grid` CSS.
- No live auto-refresh timer (live/up-next computed at load).
- No speaker avatars (names only).
- No changes to `script/refresh-data.sh` or the Sessionize/2025 render path.

## Verification Plan

1. `zola serve` → load `/2026/schedule/`: days render as tabs; cards show correct
   start–end times **in Pacific**, titles link to pretalx, abstracts clamp + "Details", track
   chips hidden (single track today), room shown in day meta (single room today).
2. Switch day tabs (Thu/Fri/Sat); confirm correct sessions per day and correct default day.
3. Force an error (temporarily point `data-schedule-url` at a bad URL) → error state + fallback
   link appears.
4. `/2025/schedule/` still renders server-side, unchanged.
5. `nix build` still succeeds (no build-time network introduced).
6. Narrow viewport: tabs wrap, cards stack cleanly.

## Open Assumptions (confirm at review)

- pretalx host/path pattern `cfp.nix.vegas/<year>/…` (derive URL from year).
- Track chip keyed on `track` (colored) rather than submission `type`.
- New-year scaffold defaults future years to `schedule-pretalx.html`.
