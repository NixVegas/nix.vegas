# nix.vegas Site Architecture Redesign

**Date:** 2026-05-15
**Status:** Draft, pending review of final spec document

## Goals

Replace the ad-hoc "current year at root, archive at `/YYYY/`" pattern with a uniform model where every event year lives at `/YYYY/`, the root is an evergreen project page, and year rollover is a single config change plus a scaffolding command. Eliminate the template machinery that exists only to special-case "current year" (path regex matching, the `onsite` build flag, dual onsite/offsite rendering paths).

## Non-goals

- Migrating away from Zola, SCSS, or Netlify.
- Redesigning visual style. The glitch effect, typography, and component look stay. Only structure changes.
- Touching CFP infrastructure (`cfp.nix.vegas` remains a separate domain).
- Reformatting archived 2025 content. Archive pages render with year-scoped navigation and otherwise look as they did during the event.

## Decisions

### URL structure

All event years live at `/YYYY/`. The root `/` is an evergreen project page that points at the current event. No URL ever changes meaning year-over-year. External links to `/2026/schedule`, `/2027/about`, etc. remain valid permanently.

### External link preservation

Currently-canonical root URLs (`/about`, `/schedule`, `/speakers`) 301-redirect to the current year's equivalent. The redirect target updates when `current_year` flips. The anchor `/#sponsors` is not preserved; the one blog post that links to it (`dc32-nixmesh`) gets a one-time edit to point at `/2025/#sponsors`.

### Year rollover

Driven by `config.extra.current_year` in `config.toml` plus the existence of a `content/YYYY/` folder. Starting a new year is:

1. `./script/new-year 2027` — scaffolds `content/2027/`, `data/2027/`, `static/img/2027/` from a checked-in skeleton; updates `config.toml`; rewrites the current-year block in `static/_redirects`.
2. Fill in placeholder content under `content/2027/`.
3. Commit.

Old years require zero changes.

### Root landing page

Lives at `/`. Composition:

1. Project hero (no glitch animation; project-level art, not year-specific).
2. Current-event callout: "DEF CON 34 · August 6–9, 2026 · Las Vegas →" linking to `/2026/`. Driven by `config.extra.current_year` plus structured fields in the current year's section frontmatter (see below).
3. About the community: short evergreen prose about Nix Vegas, SoCal NUG, and Distractions, Inc.
4. Recent posts: most recent 3 from `/blog`.
5. Past events: auto-generated descending list of past years, excluding `current_year`. Each entry shows year + tagline + DEF CON number, pulled from that year's frontmatter.
6. Contact and social bar.

Rendered by a new `templates/root.html`. The root is touched only when (a) `current_year` flips, (b) about-the-community copy changes, or (c) a year is added.

**Year-section frontmatter additions.** Each year's `content/YYYY/_index.md` gains structured fields under `extra` so the root (and other templates) can render dates/location without parsing markdown prose:

```yaml
extra:
  # ... existing favicon/hero fields ...
  event_dates: "August 6–9, 2026"
  event_location: "Las Vegas"
  event_defcon: "DEF CON 34"
  event_defcon_url: "https://defcon.org/html/defcon-34/"
  event_tagline: ""                   # short phrase, e.g. "Rebuild the World" for 2025
```

The 2025 archive section gets these fields populated from existing content (`event_tagline: "Rebuild the World"`, `event_defcon: "DEF CON 33"`, etc.) so the past-events list on the root can render them. This is a one-time edit to the archive's frontmatter only; markdown body content is untouched.

### Onsite mode

The build-time `config.extra.onsite` flag is removed. Onsite content becomes a normal page at `/YYYY/onsite`, rendered by a new `templates/onsite.html`. The `nixVegasOnsite` flake output is dropped. Conference kiosks bookmark `/{{ current_year }}/onsite` directly.

Past-year `/YYYY/onsite` pages are preserved by the same mechanism — they exist as regular content pages.

### Year-home intro content (offsite.md handling)

The current `home.html` template renders `YYYY/offsite.md` content above `YYYY/_index.md` section content (this is the "Welcome / Rebuild the World" intro on 2025's home). With the onsite/offsite build flag removed, this two-file pattern is no longer needed for that purpose.

**Decision:** keep the file but rename the concept. `YYYY/offsite.md` is renamed to `YYYY/intro.md` going forward, and `templates/year_home.html` unconditionally renders `YYYY/intro.md` (if present) above the section content. For the 2025 archive, the existing `content/2025/offsite.md` is renamed to `content/2025/intro.md` — this is a file rename only, no content edits, so the "don't modify archive content" principle holds (the rendered HTML is unchanged). The root `content/offsite.md` (empty) is deleted in Step 1, not renamed. For 2026 onward, the year-template skeleton includes an `intro.md` placeholder.

### Blog organization

Posts move from flat `/blog/<slug>` to year-grouped `/blog/YYYY/<slug>`. Year is the post's date-frontmatter year, not its subject year:

- `2025-retrospective` → `/blog/2025/2025-retrospective`
- `artwork` → `/blog/2025/artwork`
- `sneak-preview` → `/blog/2025/sneak-preview`
- `dc32-nixmesh` → `/blog/2025/dc32-nixmesh` (posted 2025-06-03, even though about DC32/2024)

Permanent 301 redirects from old slugs preserve external links. The blog index (`/blog`) groups by year visually.

### Navigation

Year-scoped. When rendering a page under `/YYYY/`, navigation links resolve to that year's pages (`/YYYY/schedule`, `/YYYY/speakers`, etc.). When rendering root or blog pages, links resolve to `config.extra.current_year`. A "Current event →" link appears only when the page being viewed is not the current year (i.e., archive pages get a pointer to the live event).

No archive banner; the URL bar is the only "you are viewing an archive" indicator.

### Redirect strategy

Single file at `static/_redirects` (Netlify-native), version-controlled, hand-readable. Two regions:

```
# Current-year vanity redirects (managed by script/new-year)
# BEGIN current-year
/about     /2026/about      301
/schedule  /2026/schedule   301
/speakers  /2026/speakers   301
# END current-year

# Permanent blog redirects (manual)
/blog/2025-retrospective   /blog/2025/2025-retrospective   301
/blog/artwork              /blog/2025/artwork              301
/blog/sneak-preview        /blog/2025/sneak-preview        301
/blog/dc32-nixmesh         /blog/2025/dc32-nixmesh         301
```

The `BEGIN/END current-year` markers let `script/new-year` rewrite just that block.

## Architecture

### Content layout (final state, after all migration steps)

```
content/
├── _index.md                         # Evergreen root landing
├── blog/
│   ├── _index.md                     # Blog index (year-grouped view)
│   ├── 2025/
│   │   ├── 2025-retrospective.md
│   │   ├── artwork.md
│   │   ├── dc32-nixmesh.md
│   │   └── sneak-preview.md
│   └── 2026/                         # (future posts)
├── 2025/                             # Archive (frontmatter touched for event_* fields; body content untouched)
│   ├── _index.md
│   ├── hero.md
│   ├── intro.md                      # Renamed from offsite.md in Step 5
│   ├── about/_index.md
│   ├── schedule.md
│   ├── speakers.md
│   ├── sponsors.md
│   └── onsite.md                     # Now a standalone page at /2025/onsite
└── 2026/                             # Current event (moved from root)
    ├── _index.md
    ├── hero.md
    ├── intro.md                      # Renamed from offsite.md in Step 5
    ├── about/_index.md
    ├── schedule.md
    ├── speakers.md
    ├── sponsors.md
    └── onsite.md
```

### Templates

```
templates/
├── base.html                         # HTML shell; year-aware via config.extra.current_year
├── root.html                         # Evergreen root landing (NEW)
├── year_home.html                    # Year landing (renamed from home.html)
├── about.html                        # Year about page
├── blog.html                         # Blog index (year-grouped)
├── blog_post.html                    # Single post (was blog_templates/base.html)
├── schedule.html                     # Data-driven, year-scoped
├── speakers.html                     # Data-driven, year-scoped
├── onsite.html                       # NEW: standalone onsite page
├── components/
│   ├── hero.html                     # Glitch effect remains opt-in via frontmatter
│   ├── navigation.html               # Year-scoped (no onsite branch, no regex)
│   ├── footer.html
│   ├── social_bar.html               # Renamed from social-bar.html
│   ├── current_event_callout.html    # NEW: used by root.html
│   ├── past_events_list.html         # NEW: used by root.html
│   └── recent_posts.html             # NEW: used by root.html
├── macros/
│   ├── date.html
│   ├── social.html
│   └── year.html                     # NEW: year-resolution helpers
└── shortcodes/                       # Unchanged
```

**Removed:**

- `templates/components/speakers_list.html` (empty)
- `templates/blog_templates/` (folded into `blog_post.html`)

**Key invariants:**

- No template uses regex on `current_path`. Year context comes from `page.ancestors` (for "what year is this page in") and `config.extra.current_year` (for "what year is the live event").
- No template branches on `config.extra.onsite`.

### Styles

```
sass/
├── style.scss
├── reset.scss
├── typography.scss
├── glitch.scss                       # Unchanged; opt-in per year
└── components/
    ├── hero.scss
    ├── schedule.scss
    ├── speakers.scss
    ├── navigation.scss
    ├── sponsors.scss
    ├── social_bar.scss               # Renamed from social-bar.scss
    ├── blog.scss
    ├── footer.scss
    └── root.scss                     # NEW: root-only styles
```

### Data

```
data/
├── 2025/
│   ├── schedule.json
│   └── speakers-filtered.json
└── 2026/
    ├── schedule.json
    └── speakers-filtered.json
```

(Currently `data/` is flat; this introduces year subfolders. Templates resolve year from the page they're rendering.)

### Static assets

`static/img/YYYY/` for year-scoped art (already in place). `static/img/sponsors/`, `static/img/social-icons/`, and root-level favicons remain shared.

### Flake / build

`flake.nix` packages collapse from `default` + `nixVegasOffsite` + `nixVegasOnsite` to a single `default` (= `nix-vegas-site`). `pkgs/nix-vegas-site/` derivation drops the `onsite` parameter.

`netlify.toml` continues to drive deploys; no changes required beyond pointing at the single build output.

### Scaffolding script

`script/new-year YYYY`:

1. Validate: `YYYY` is a four-digit year; `content/YYYY/` does not already exist.
2. Copy `script/year-template/` → `content/YYYY/`.
3. Create empty `data/YYYY/schedule.json` (`[]`) and `data/YYYY/speakers-filtered.json` (`[]`).
4. Create `static/img/YYYY/` with `.gitkeep`.
5. Rewrite the `# BEGIN current-year ... # END current-year` block of `static/_redirects` to use `YYYY`.
6. Update `config.toml`: set `current_year = "YYYY"`. Prompt before updating `cfp_year`.
7. Print next-steps: which files in `content/YYYY/` need filling in.

`script/year-template/`:

```
year-template/
├── _index.md          # Frontmatter (incl. event_dates, event_location, event_defcon, etc.) + CFP / theme / sponsors section placeholders
├── hero.md            # Frontmatter + placeholder title and dates
├── intro.md           # Optional intro/theme content rendered above section by year_home.html
├── about/_index.md    # Placeholder for dates, location, badge info, contact
├── schedule.md        # Frontmatter only (data-driven render)
├── speakers.md        # Frontmatter only
├── sponsors.md        # Placeholder section structure
└── onsite.md          # Placeholder for binary cache / ISO / docs sections
```

## Migration plan

Each step ships and works on its own.

**Step 1 — Move current-year content into `/2026/`.**
Move `content/_index.md`, `content/hero.md`, `content/about/` into `content/2026/`. Move `content/offsite.md` (root, empty) → `content/2026/offsite.md` (still empty, just relocated so `home.html`'s `page_prefix + offsite.md` resolves under the new path). Populate `extra` frontmatter fields on `content/2025/_index.md` and `content/2026/_index.md` (`event_dates`, `event_location`, `event_defcon`, `event_defcon_url`, `event_tagline`). Add `static/_redirects` with permanent blog redirects + current-year block pointing at 2026. Update internal hardcoded links.

Templates are not touched in Step 1. Existing `home.html` still resolves `page_prefix` to `2026/` from `current_path` and renders correctly.

**Step 2 — Add evergreen root.**
New `content/_index.md`, `templates/root.html`, root components (`current_event_callout`, `past_events_list`, `recent_posts`), `sass/components/root.scss`. Root now serves the project landing.

**Step 3 — Reorganize blog by year.**
Move blog posts into year subfolders. Add blog redirects to `static/_redirects`. Update `templates/blog.html` to group by year. Edit `content/blog/2025/dc32-nixmesh.md` to fix the `/#sponsors` reference. Fix the `DEF CON 26` typo in `content/2026/_index.md` (should be `DEF CON 34`).

**Step 4 — Template refactor (no behavior change).**
Replace `current_path` regex in `base.html` with `config.extra.current_year` + `page.ancestors` logic. Rename `home.html` → `year_home.html`. Collapse `blog_templates/` into `blog_post.html`. Rename `social-bar.html`/`.scss` → `social_bar.html`/`.scss`. Add `macros/year.html`. Update navigation: year-scoped via page context; add "Current event →" link when not on current year.

**Step 5 — Drop onsite build flag and rename offsite → intro.**
Remove `config.extra.onsite`. Render `content/YYYY/onsite.md` as its own page at `/YYYY/onsite` using new `templates/onsite.html`. Rename `content/2025/offsite.md` → `content/2025/intro.md` and `content/2026/offsite.md` → `content/2026/intro.md` (file rename only; content untouched). Update `templates/year_home.html` to unconditionally render `YYYY/intro.md` above section content (no `config.extra.onsite` branch). Update `flake.nix` to drop `nixVegasOnsite`. Update `pkgs/nix-vegas-site/` derivation to drop the `onsite` parameter. Update navigation to remove the onsite branch.

**Step 6 — Add scaffolding script.**
Write `script/new-year` and `script/year-template/`. Test by scaffolding a throwaway `content/9999/` and verifying the output.

**Step 7 — Cleanup.**
Delete `templates/components/speakers_list.html` (empty). Delete `templates/blog_templates/`. Audit for newly vestigial files.

**Parallelization:** Steps 1–3 are content moves and must serialize (each depends on the previous file layout being settled). Steps 4–7 are internal cleanup and can interleave once Steps 1–3 are merged.

**Verification per step:**

- Steps 1–3 (user-visible): `nix build` + `zola serve` smoke test covering root, current-year home, year-about, year-schedule, year-speakers, blog list, an individual blog post, and an archived 2025 page. Verify redirects via `curl -I` against `netlify dev` or against a staging deploy.
- Steps 4–5 (refactor): same smoke test plus a `diff` of rendered HTML before/after at a representative set of URLs to confirm no unintended behavior drift.
- Step 6: scaffold a throwaway year, build, verify pages render.
- Step 7: build clean.

## Open items

- Project-level hero art for the root. Interim: use the most recent year's art (sourced via `config.extra.current_year`), with a TODO to commission or design a project-neutral asset.
- `cfp_year` semantics during the window where CFP is open for next year but content for next year doesn't exist yet. Current design: `cfp_year` is independent of `current_year`. The nav CFP link points at `cfp.nix.vegas/{{ cfp_year }}`, which is external and lives independently. No code change needed; documented for future maintainers.
