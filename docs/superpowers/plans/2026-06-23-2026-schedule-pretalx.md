# 2026 Schedule — pretalx client-side renderer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the 2026 schedule at `/2026/schedule/` by fetching the pretalx export in the browser and rendering a "day tabs + cards" layout, while moving schedule templates to a per-CFP-tool naming scheme that leaves the 2025 archive unchanged.

**Architecture:** A new tool-specific Zola template (`schedule-pretalx.html`) emits a static shell with `data-*` attributes and loads one vanilla `static/js/schedule.js`. The script fetches `schedule.json` (CORS-enabled), transforms it through pure functions into a view model, and builds the DOM with `createElement`/`textContent`. The pure transform/format/live-next functions are unit-tested with Node's built-in test runner (no npm/bundler); DOM rendering and fetch are verified in the browser. The existing Sessionize template is renamed and keeps rendering the 2025 archive server-side, unchanged.

**Tech Stack:** Zola (static site, Tera templates, SCSS), vanilla browser JS (no framework/bundler), Node built-in `node:test` for dev-only unit tests (provided via `nix shell nixpkgs#nodejs`).

## Global Constraints

Every task's requirements implicitly include these. Values copied verbatim from the spec.

- **Static site, no build tooling for the shipped site.** `static/js/schedule.js` is a single classic script loaded with `defer`; **no** bundler, **no** npm/`package.json`, **no** `import`/`export` syntax, **no** runtime dependencies. Node is **dev-only**, for running unit tests — it must not become a build input of `pkgs/nix-vegas-site` (that derivation still runs only `zola build`).
- **Endpoint URL pattern:** `https://cfp.nix.vegas/<year>/schedule/export/schedule.json`. **Public fallback:** `https://cfp.nix.vegas/<year>/schedule/`. The `<year>` comes from the page path via the existing `year_macros::year_of_page` macro.
- **Display timezone:** `America/Los_Angeles` (from `config.extra.timezone`). All times formatted in this zone via `Intl.DateTimeFormat`; all comparisons use absolute `Date` instants.
- **Security:** build DOM only via `createElement`/`textContent` — never `innerHTML` with fetched data. Title links rendered only when `url` starts with `https://cfp.nix.vegas/`, with `rel="noopener"`. `fetch()` is credential-less.
- **2025 archive output must remain byte-for-byte identical.**
- **Commit messages:** plain Conventional Commits; **do not** add any AI co-author trailer.
- **Track colors** come from the JSON (`schedule.conference.tracks[].color`), not hardcoded. Brand palette for SCSS: bg `#1b1b1d`/panel `#202024`, border `#2e2e33`, cyan accent `#66ccee`, pink accent `#e0287d`, muted text `#b9bcc2`/`#7d8288`, live green `#33d17a`.
- **Test command (used throughout):** `nix shell nixpkgs#nodejs --command node --test tests/schedule.test.js`
- **Syntax-check command:** `nix shell nixpkgs#nodejs --command node --check static/js/schedule.js`
- **Site build command:** `nix develop -c zola build` (uses the flake's pinned **zola 0.21.0**, matching Netlify's `ZOLA_VERSION`). **Do NOT** use `nix shell nixpkgs#zola` — that resolves to zola 0.22.1, which rejects this repo's `config.toml` (`highlight_code`). Node test commands may use `nix shell nixpkgs#nodejs` (version-independent).

---

## File Structure

- `templates/schedule.html` → `templates/schedule-sessionize.html` — **renamed** (unchanged content). Sessionize server-side renderer; used by 2025 and earlier.
- `templates/schedule-pretalx.html` — **new.** Client-side shell: page header, the `[data-schedule-url]` container with initial loading + `<noscript>` markup, and the `<script defer>`.
- `static/js/schedule.js` — **new.** Pure transform/format/live-next functions (Node-testable, dual-mode export) + browser-only DOM renderer + bootstrap.
- `tests/schedule.test.js` — **new.** `node:test` unit tests for the pure functions.
- `tests/fixtures/pretalx-schedule.json` — **new.** Synthetic fixture exercising empty-day skip, single/multi room, multiple tracks, speaker `public_name`/`name`/empty, and `description`/`abstract` fallback.
- `sass/components/schedule-pretalx.scss` — **new.** Direction-B styles, namespaced under `.pretalx-schedule`.
- `sass/style.scss` — **modify.** Add one `@import`.
- `content/2026/schedule.md` — **modify.** `template:` → `schedule-pretalx.html` (done in Task 8).
- `content/2025/schedule.md` — **modify.** `template:` → `schedule-sessionize.html`.
- `script/year-template/schedule.md` — **modify.** Scaffold default → `schedule-pretalx.html` (done in Task 8).
- `flake.nix` — **modify.** Add `nodejs` to `devShells.default` (dev convenience).

---

## Task 1: Rename Sessionize template, keep the build green (no behavior change)

Renames the shared template to its tool-specific name and repoints both existing years at it. 2026 stays on the Sessionize template for now (its data file is `[]`, so it keeps showing "Coming soon" exactly as today); Task 8 flips 2026 to pretalx. The scaffold still references `schedule.html` after this task, which is harmless — `script/` is not built by Zola — and is fixed in Task 8.

**Files:**
- Rename: `templates/schedule.html` → `templates/schedule-sessionize.html`
- Modify: `content/2025/schedule.md:2`
- Modify: `content/2026/schedule.md:2`

- [ ] **Step 1: Rename the template (preserve history)**

Run:
```bash
git mv templates/schedule.html templates/schedule-sessionize.html
```

- [ ] **Step 2: Repoint 2025 at the renamed template**

Edit `content/2025/schedule.md` — change line 2 from `template: "schedule.html"` to:
```yaml
template: "schedule-sessionize.html"
```
Full file should read:
```yaml
---
template: "schedule-sessionize.html"
title: "Schedule"
---
```

- [ ] **Step 3: Repoint 2026 at the renamed template (temporary, keeps build green)**

Edit `content/2026/schedule.md` — change line 2 from `template: "schedule.html"` to:
```yaml
template: "schedule-sessionize.html"
```
Full file should read:
```yaml
---
template: "schedule-sessionize.html"
title: "Schedule"
---
```

- [ ] **Step 4: Build and verify no behavior change**

Run:
```bash
nix develop -c zola build
```
Expected: build succeeds (exit 0), no template errors.

Then confirm the rendered pages are unchanged:
```bash
grep -c "schedule-day" public/2025/schedule/index.html   # 2025 still renders its sessions
grep -c "Coming soon" public/2026/schedule/index.html     # 2026 still shows the coming-soon state
```
Expected: 2025 count > 0 (sessions rendered), 2026 count = 1 (coming-soon, as before).

- [ ] **Step 5: Commit**

```bash
git add templates/schedule-sessionize.html content/2025/schedule.md content/2026/schedule.md
git commit -m "templates: rename schedule.html -> schedule-sessionize.html (per-CFP-tool naming)"
```

---

## Task 2: JS test harness + duration/end-time helpers (TDD)

Sets up the dev test runner and the dual-mode `schedule.js` skeleton, then implements the first pure helpers. After this task, `schedule.js` exists as a Node-testable module but is not yet referenced by any page, so the site build stays green.

**Files:**
- Modify: `flake.nix:52-60` (add `nodejs` to devShell)
- Create: `static/js/schedule.js`
- Create: `tests/fixtures/pretalx-schedule.json`
- Create: `tests/schedule.test.js`

**Interfaces:**
- Produces: `parseDurationMinutes(hhmm: string) -> number`, `computeEnd(startISO: string, durationHHMM: string) -> Date`. Exported on `module.exports` for Node tests.

- [ ] **Step 1: Add nodejs to the devShell (dev convenience)**

Edit `flake.nix` — in `devShells.default.buildInputs`, add `nodejs`:
```nix
          devShells.default = pkgs.mkShell {
            buildInputs = with pkgs; [
              zola
              alejandra
              pngcrush
              nodePackages.svgo
              nixfmt-rfc-style
              nodejs
            ];
          };
```

- [ ] **Step 2: Create the synthetic test fixture**

Create `tests/fixtures/pretalx-schedule.json` with exactly:
```json
{
  "schedule": {
    "version": "test",
    "conference": {
      "title": "Nix Vegas Test",
      "acronym": "2026",
      "start": "2026-08-06",
      "end": "2026-08-09",
      "time_zone_name": "America/Los_Angeles",
      "tracks": [
        { "name": "Talks", "slug": "1-talks", "color": "#426c76" },
        { "name": "Projects", "slug": "2-projects", "color": "#979bd1" },
        { "name": "Events", "slug": "3-events", "color": "#aa1d1d" }
      ],
      "rooms": [
        { "name": "Main Stage" },
        { "name": "Community Stage" }
      ],
      "days": [
        { "index": 1, "date": "2026-08-06", "rooms": {} },
        {
          "index": 2,
          "date": "2026-08-07",
          "rooms": {
            "Main Stage": [
              {
                "code": "AAA111", "date": "2026-08-07T10:00:00-07:00", "start": "10:00",
                "duration": "00:30", "room": "Main Stage", "title": "Opening Ceremony",
                "url": "https://cfp.nix.vegas/2026/talk/AAA111/", "track": "Events",
                "abstract": "Kickoff and opening of the Nix Vegas space.", "description": null,
                "persons": []
              },
              {
                "code": "BBB222", "date": "2026-08-07T12:00:00-07:00", "start": "12:00",
                "duration": "01:00", "room": "Main Stage", "title": "Whose PR Is It Anyway?",
                "url": "https://cfp.nix.vegas/2026/talk/BBB222/", "track": "Talks",
                "abstract": "Short abstract.", "description": "Full description here.",
                "persons": [
                  { "public_name": "Jane Hacker", "name": "Jane H" },
                  { "public_name": "Alex Nixon", "name": "Alex N" }
                ]
              }
            ]
          }
        },
        {
          "index": 3,
          "date": "2026-08-08",
          "rooms": {
            "Main Stage": [
              {
                "code": "CCC333", "date": "2026-08-08T13:00:00-07:00", "start": "13:00",
                "duration": "00:30", "room": "Main Stage", "title": "Projects Showcase",
                "url": "https://cfp.nix.vegas/2026/talk/CCC333/", "track": "Projects",
                "abstract": "Projects abstract.", "description": null,
                "persons": [ { "name": "Sam Builder" } ]
              }
            ],
            "Community Stage": [
              {
                "code": "DDD444", "date": "2026-08-08T13:30:00-07:00", "start": "13:30",
                "duration": "00:45", "room": "Community Stage", "title": "Community Hour",
                "url": "https://cfp.nix.vegas/2026/talk/DDD444/", "track": "Events",
                "abstract": "Community abstract.", "description": null,
                "persons": []
              }
            ]
          }
        }
      ]
    }
  }
}
```

- [ ] **Step 3: Create the schedule.js skeleton with the first two helpers**

Create `static/js/schedule.js`:
```js
/* Nix Vegas schedule renderer — fetches the pretalx schedule export and renders it.
   Single classic script (no bundler/imports). Pure functions are exported for Node
   unit tests; browser bootstrap runs only when a document is present. */
(function () {
  'use strict';

  // ---- pure helpers ----

  function parseDurationMinutes(hhmm) {
    const parts = String(hhmm).split(':');
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    return h * 60 + m;
  }

  function computeEnd(startISO, durationHHMM) {
    const start = new Date(startISO);
    return new Date(start.getTime() + parseDurationMinutes(durationHHMM) * 60000);
  }

  // ---- Node export (browser leaves `module` undefined) ----
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseDurationMinutes, computeEnd };
  }
})();
```

- [ ] **Step 4: Write the failing tests**

Create `tests/schedule.test.js`:
```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const S = require('../static/js/schedule.js');

test('parseDurationMinutes parses HH:MM', () => {
  assert.strictEqual(S.parseDurationMinutes('00:30'), 30);
  assert.strictEqual(S.parseDurationMinutes('01:00'), 60);
  assert.strictEqual(S.parseDurationMinutes('00:45'), 45);
  assert.strictEqual(S.parseDurationMinutes('01:30'), 90);
});

test('computeEnd adds the duration to the start instant', () => {
  const end = S.computeEnd('2026-08-07T10:00:00-07:00', '00:30');
  assert.strictEqual(end.toISOString(), new Date('2026-08-07T10:30:00-07:00').toISOString());
  const end2 = S.computeEnd('2026-08-07T12:00:00-07:00', '01:00');
  assert.strictEqual(end2.toISOString(), new Date('2026-08-07T13:00:00-07:00').toISOString());
});
```

- [ ] **Step 5: Run the tests to verify they pass**

Run:
```bash
nix shell nixpkgs#nodejs --command node --test tests/schedule.test.js
```
Expected: `# pass 2`, `# fail 0`.

- [ ] **Step 6: Verify the site still builds (schedule.js not yet referenced)**

Run:
```bash
nix develop -c zola build
```
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add flake.nix static/js/schedule.js tests/fixtures/pretalx-schedule.json tests/schedule.test.js
git commit -m "schedule: add JS test harness + duration/end-time helpers"
```

---

## Task 3: Time/label/date-key formatters (TDD)

Adds the timezone-aware formatters, including coverage for the day-label UTC pitfall.

**Files:**
- Modify: `static/js/schedule.js`
- Modify: `tests/schedule.test.js`

**Interfaces:**
- Produces: `formatTime(date: Date, tz: string) -> "HH:MM"`, `formatDayLabel(date: Date, tz: string) -> "Weekday, Month D"`, `dateKey(date: Date, tz: string) -> "YYYY-MM-DD"`.

- [ ] **Step 1: Write the failing tests**

Add to `tests/schedule.test.js`:
```js
test('formatTime renders 24h time in the given zone', () => {
  assert.strictEqual(S.formatTime(new Date('2026-08-07T10:00:00-07:00'), 'America/Los_Angeles'), '10:00');
  // An instant given in UTC still renders in Pacific (the day-label/time pitfall):
  assert.strictEqual(S.formatTime(new Date('2026-08-07T17:00:00Z'), 'America/Los_Angeles'), '10:00');
});

test('formatDayLabel renders weekday/month/day in the given zone', () => {
  assert.strictEqual(S.formatDayLabel(new Date('2026-08-07T10:00:00-07:00'), 'America/Los_Angeles'), 'Friday, August 7');
  assert.strictEqual(S.formatDayLabel(new Date('2026-08-08T13:00:00-07:00'), 'America/Los_Angeles'), 'Saturday, August 8');
});

test('dateKey returns ISO-ordered Y-M-D in the given zone', () => {
  assert.strictEqual(S.dateKey(new Date('2026-08-07T10:00:00-07:00'), 'America/Los_Angeles'), '2026-08-07');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:
```bash
nix shell nixpkgs#nodejs --command node --test tests/schedule.test.js
```
Expected: failures with `S.formatTime is not a function` (and the other two).

- [ ] **Step 3: Implement the formatters**

In `static/js/schedule.js`, add these functions after `computeEnd`:
```js
  function formatTime(date, tz) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date);
  }

  function formatDayLabel(date, tz) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz, weekday: 'long', month: 'long', day: 'numeric'
    }).format(date);
  }

  function dateKey(date, tz) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(date);
  }
```

Update the export block to:
```js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseDurationMinutes, computeEnd, formatTime, formatDayLabel, dateKey };
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:
```bash
nix shell nixpkgs#nodejs --command node --test tests/schedule.test.js
```
Expected: `# pass 5`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add static/js/schedule.js tests/schedule.test.js
git commit -m "schedule: add timezone-aware time/label/date-key formatters"
```

---

## Task 4: buildViewModel + field-mapping helpers (TDD)

Transforms the pretalx JSON into the render-ready view model: skips empty days/rooms, sorts sessions, maps fields, computes per-day `multiRoom`/`roomName`, and the schedule-wide `showTrackChips`.

**Files:**
- Modify: `static/js/schedule.js`
- Modify: `tests/schedule.test.js`

**Interfaces:**
- Produces:
  - `speakerNames(persons) -> string[]`
  - `pickBody(talk) -> string`
  - `trackColorMap(conference) -> { [trackName]: color }`
  - `buildViewModel(json, tz) -> { showTrackChips: boolean, days: Day[] }` where
    `Day = { label, dateKey, multiRoom, roomName|null, rooms: {name, sessions}[], sessions: Session[] }` and
    `Session = { code, title, url, room, track|null, trackColor|null, speakers: string[], body, startInstant: Date, endInstant: Date, start: "HH:MM", end: "HH:MM", isLive: false, isNext: false }`.
  - Day-level `sessions` is the flat, start-sorted list across all rooms (used by Task 5 and the renderer's live/next + default-day logic).

- [ ] **Step 1: Write the failing tests**

Add to `tests/schedule.test.js`:
```js
const fs = require('node:fs');
const path = require('node:path');
const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/pretalx-schedule.json'), 'utf8'));
const TZ = 'America/Los_Angeles';

test('speakerNames prefers public_name, falls back to name, drops empties', () => {
  assert.deepStrictEqual(S.speakerNames([{ public_name: 'Jane Hacker', name: 'x' }, { name: 'Sam Builder' }]), ['Jane Hacker', 'Sam Builder']);
  assert.deepStrictEqual(S.speakerNames([]), []);
  assert.deepStrictEqual(S.speakerNames(undefined), []);
});

test('pickBody prefers description, falls back to abstract', () => {
  assert.strictEqual(S.pickBody({ description: 'D', abstract: 'A' }), 'D');
  assert.strictEqual(S.pickBody({ description: null, abstract: 'A' }), 'A');
  assert.strictEqual(S.pickBody({ description: '   ', abstract: 'A' }), 'A');
});

test('buildViewModel skips empty days and builds days/sessions', () => {
  const vm = S.buildViewModel(FIXTURE, TZ);
  assert.strictEqual(vm.days.length, 2);                 // Aug 6 (empty) skipped
  assert.strictEqual(vm.showTrackChips, true);           // Events + Talks + Projects

  const d0 = vm.days[0];
  assert.strictEqual(d0.label, 'Friday, August 7');
  assert.strictEqual(d0.multiRoom, false);
  assert.strictEqual(d0.roomName, 'Main Stage');
  assert.strictEqual(d0.sessions.length, 2);
  assert.strictEqual(d0.sessions[0].start, '10:00');
  assert.strictEqual(d0.sessions[0].end, '10:30');
  assert.strictEqual(d0.sessions[0].track, 'Events');
  assert.strictEqual(d0.sessions[0].trackColor, '#aa1d1d');
  assert.deepStrictEqual(d0.sessions[0].speakers, []);
  assert.strictEqual(d0.sessions[0].body, 'Kickoff and opening of the Nix Vegas space.');
  assert.strictEqual(d0.sessions[1].start, '12:00');
  assert.strictEqual(d0.sessions[1].end, '13:00');
  assert.strictEqual(d0.sessions[1].trackColor, '#426c76');
  assert.deepStrictEqual(d0.sessions[1].speakers, ['Jane Hacker', 'Alex Nixon']);
  assert.strictEqual(d0.sessions[1].body, 'Full description here.');

  const d1 = vm.days[1];
  assert.strictEqual(d1.label, 'Saturday, August 8');
  assert.strictEqual(d1.multiRoom, true);
  assert.strictEqual(d1.roomName, null);
  assert.strictEqual(d1.sessions.length, 2);
  assert.strictEqual(d1.sessions[0].room, 'Main Stage');
  assert.deepStrictEqual(d1.sessions[0].speakers, ['Sam Builder']);
  assert.strictEqual(d1.sessions[1].room, 'Community Stage');
  assert.strictEqual(d1.sessions[1].start, '13:30');
  assert.strictEqual(d1.sessions[1].end, '14:15');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:
```bash
nix shell nixpkgs#nodejs --command node --test tests/schedule.test.js
```
Expected: failures referencing `S.buildViewModel`/`S.speakerNames`/`S.pickBody`.

- [ ] **Step 3: Implement the transform**

In `static/js/schedule.js`, add after `dateKey`:
```js
  function speakerNames(persons) {
    return (persons || []).map(function (p) { return p.public_name || p.name; }).filter(Boolean);
  }

  function pickBody(talk) {
    if (talk.description && talk.description.trim()) return talk.description;
    return talk.abstract || '';
  }

  function trackColorMap(conference) {
    var map = {};
    (conference.tracks || []).forEach(function (t) { map[t.name] = t.color; });
    return map;
  }

  function buildViewModel(json, tz) {
    var conf = json.schedule.conference;
    var colors = trackColorMap(conf);
    var days = [];

    (conf.days || []).forEach(function (day) {
      var roomEntries = Object.keys(day.rooms || {})
        .map(function (name) { return [name, day.rooms[name]]; })
        .filter(function (e) { return e[1] && e[1].length > 0; });
      if (roomEntries.length === 0) return; // skip empty day

      var rooms = roomEntries.map(function (e) {
        var name = e[0];
        var talks = e[1].slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
        return {
          name: name,
          sessions: talks.map(function (t) {
            var startInstant = new Date(t.date);
            var endInstant = computeEnd(t.date, t.duration);
            return {
              code: t.code,
              title: t.title,
              url: t.url,
              room: t.room || name,
              track: t.track || null,
              trackColor: colors[t.track] || null,
              speakers: speakerNames(t.persons),
              body: pickBody(t),
              startInstant: startInstant,
              endInstant: endInstant,
              start: formatTime(startInstant, tz),
              end: formatTime(endInstant, tz),
              isLive: false,
              isNext: false
            };
          })
        };
      });

      var allSessions = rooms.reduce(function (acc, r) { return acc.concat(r.sessions); }, [])
        .sort(function (a, b) { return a.startInstant - b.startInstant; });

      days.push({
        label: formatDayLabel(allSessions[0].startInstant, tz),
        dateKey: dateKey(allSessions[0].startInstant, tz),
        multiRoom: rooms.length > 1,
        roomName: rooms.length === 1 ? rooms[0].name : null,
        rooms: rooms,
        sessions: allSessions
      });
    });

    var tracks = {};
    days.forEach(function (d) { d.sessions.forEach(function (s) { if (s.track) tracks[s.track] = true; }); });

    // `tz` is carried on the view model so default-day selection (Task 5) keys `now`
    // into the same display zone the day labels were built in.
    return { showTrackChips: Object.keys(tracks).length > 1, days: days, tz: tz };
  }
```

Update the export block to:
```js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      parseDurationMinutes, computeEnd, formatTime, formatDayLabel, dateKey,
      speakerNames, pickBody, trackColorMap, buildViewModel
    };
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:
```bash
nix shell nixpkgs#nodejs --command node --test tests/schedule.test.js
```
Expected: `# pass 8`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add static/js/schedule.js tests/schedule.test.js
git commit -m "schedule: add buildViewModel transform + field-mapping helpers"
```

---

## Task 5: Live/up-next annotation + default-day selection (TDD)

Adds the time-aware logic that the renderer uses to highlight the live and next session and to choose the initially active day tab. `now` is injected as a parameter so the logic is deterministic and testable.

**Files:**
- Modify: `static/js/schedule.js`
- Modify: `tests/schedule.test.js`

**Interfaces:**
- Produces:
  - `annotateLiveNext(vm, now: Date) -> vm` — mutates each session's `isLive`/`isNext`. `isLive` when `start <= now < end`. `isNext` set on the earliest session that starts strictly after `now`, per day.
  - `pickDefaultDayIndex(vm, now: Date) -> number` — index of the day whose `dateKey` equals `now`'s key; else the first day with `dateKey >= now`'s key; else `0`.

- [ ] **Step 1: Write the failing tests**

Add to `tests/schedule.test.js`:
```js
test('annotateLiveNext flags the running session and the next upcoming one', () => {
  const vm = S.buildViewModel(FIXTURE, TZ);
  // 12:30 PT on Aug 7: session BBB222 (12:00-13:00) is live; nothing later that day -> no isNext on day 0.
  S.annotateLiveNext(vm, new Date('2026-08-07T12:30:00-07:00'));
  assert.strictEqual(vm.days[0].sessions[0].isLive, false);
  assert.strictEqual(vm.days[0].sessions[1].isLive, true);
  assert.strictEqual(vm.days[0].sessions[0].isNext, false);
  assert.strictEqual(vm.days[0].sessions[1].isNext, false);
});

test('annotateLiveNext flags up-next before the day starts', () => {
  const vm = S.buildViewModel(FIXTURE, TZ);
  S.annotateLiveNext(vm, new Date('2026-08-07T09:00:00-07:00'));
  assert.strictEqual(vm.days[0].sessions[0].isNext, true);
  assert.strictEqual(vm.days[0].sessions[1].isNext, false);
  assert.strictEqual(vm.days[0].sessions[0].isLive, false);
});

test('pickDefaultDayIndex matches today, else first upcoming, else 0', () => {
  const vm = S.buildViewModel(FIXTURE, TZ);
  assert.strictEqual(S.pickDefaultDayIndex(vm, new Date('2026-08-08T09:00:00-07:00')), 1); // matches Aug 8
  assert.strictEqual(S.pickDefaultDayIndex(vm, new Date('2026-08-07T23:00:00-07:00')), 0); // matches Aug 7
  assert.strictEqual(S.pickDefaultDayIndex(vm, new Date('2026-08-01T09:00:00-07:00')), 0); // before event -> first
  assert.strictEqual(S.pickDefaultDayIndex(vm, new Date('2026-09-01T09:00:00-07:00')), 0); // after event -> 0
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:
```bash
nix shell nixpkgs#nodejs --command node --test tests/schedule.test.js
```
Expected: failures referencing `S.annotateLiveNext`/`S.pickDefaultDayIndex`.

- [ ] **Step 3: Implement the logic**

In `static/js/schedule.js`, add after `buildViewModel` (note: `buildViewModel` already
returns `tz` from Task 4, which `pickDefaultDayIndex` uses to key `now` into the display zone):
```js
  function annotateLiveNext(vm, now) {
    var nowMs = now.getTime();
    vm.days.forEach(function (day) {
      day.sessions.forEach(function (s) {
        s.isLive = s.startInstant.getTime() <= nowMs && nowMs < s.endInstant.getTime();
        s.isNext = false;
      });
      for (var i = 0; i < day.sessions.length; i++) {
        if (day.sessions[i].startInstant.getTime() > nowMs) { day.sessions[i].isNext = true; break; }
      }
    });
    return vm;
  }

  function pickDefaultDayIndex(vm, now) {
    if (!vm.days.length) return 0;
    var nowKey = dateKey(now, vm.tz || 'America/Los_Angeles');
    for (var i = 0; i < vm.days.length; i++) {
      if (vm.days[i].dateKey === nowKey) return i;        // today matches a scheduled day
    }
    for (var j = 0; j < vm.days.length; j++) {
      if (vm.days[j].dateKey >= nowKey) return j;          // else first upcoming day
    }
    return 0;                                              // else (event passed) first day
  }
```

Update the export block to:
```js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      parseDurationMinutes, computeEnd, formatTime, formatDayLabel, dateKey,
      speakerNames, pickBody, trackColorMap, buildViewModel,
      annotateLiveNext, pickDefaultDayIndex
    };
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:
```bash
nix shell nixpkgs#nodejs --command node --test tests/schedule.test.js
```
Expected: `# pass 11`, `# fail 0`. (If `pickDefaultDayIndex` fails, confirm `buildViewModel` returns `tz`, as added in Task 4.)

- [ ] **Step 5: Commit**

```bash
git add static/js/schedule.js tests/schedule.test.js
git commit -m "schedule: add live/up-next annotation + default-day selection"
```

---

## Task 6: Browser DOM renderer, state handling, and bootstrap

Adds the browser-only code: state helpers (loading/empty/error), the day-tabs + cards renderer, tab switching, and the `defer` bootstrap that fetches and renders. Not unit-tested (DOM/fetch); gated by `node --check` (syntax) plus the regression run of the existing unit tests, and verified end-to-end in Task 8.

**Files:**
- Modify: `static/js/schedule.js`

**Interfaces:**
- Consumes: `buildViewModel`, `annotateLiveNext`, `pickDefaultDayIndex` (from Tasks 4–5).
- DOM contract (consumed by Task 7 SCSS and Task 8 template): root element `.pretalx-schedule[data-schedule-url][data-public-url][data-timezone]`. Renderer produces: `.ps-tabs > button.ps-tab[.is-active]`, `.ps-daymeta`, `.ps-day[.is-active]`, `.ps-card[.is-live][.is-next]` containing `.ps-time`(`.ps-start`/`.ps-end`/`.ps-dur`), `.ps-info`(`.ps-flags` with `.ps-flag.is-live`/`.ps-flag.is-next`, `.ps-room`, `.ps-track`, `a.ps-title`, `p.ps-abstract`, `a.ps-details`, `.ps-speakers`). State containers: `.ps-loading`, `.ps-empty`, `.ps-error`.

- [ ] **Step 1: Implement the renderer + bootstrap**

In `static/js/schedule.js`, add the following **before** the `module.exports` block (so the export guard stays last):
```js
  // ---- browser-only rendering ----

  var CLAMP_CHARS = 120; // proxy for "abstract overflows ~2 lines" -> show Details link

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function safeTalkLink(url) {
    return typeof url === 'string' && url.indexOf('https://cfp.nix.vegas/') === 0;
  }

  function showLoading(root) {
    clear(root);
    root.appendChild(el('div', 'ps-loading', 'Loading schedule…'));
  }

  function showEmpty(root) {
    clear(root);
    var box = el('div', 'ps-empty');
    box.appendChild(el('h2', null, 'Coming soon'));
    box.appendChild(el('p', null, "The schedule isn't published yet. Check back closer to the conference."));
    root.appendChild(box);
  }

  function showError(root, publicUrl) {
    clear(root);
    var box = el('div', 'ps-error');
    box.appendChild(el('h2', null, 'Schedule unavailable'));
    var p = el('p', null, "We couldn't load the live schedule right now. ");
    var a = el('a', null, 'View it on pretalx ↗');
    a.setAttribute('href', publicUrl);
    a.setAttribute('rel', 'noopener');
    p.appendChild(a);
    box.appendChild(p);
    root.appendChild(box);
  }

  function renderCard(s, day, showTrackChips) {
    var card = el('div', 'ps-card' + (s.isLive ? ' is-live' : '') + (s.isNext ? ' is-next' : ''));

    var time = el('div', 'ps-time');
    time.appendChild(el('b', 'ps-start', s.start));
    time.appendChild(el('span', 'ps-end', '– ' + s.end));
    time.appendChild(el('span', 'ps-dur', durationLabel(s)));
    card.appendChild(time);

    var info = el('div', 'ps-info');

    var flags = el('div', 'ps-flags');
    if (s.isLive) flags.appendChild(el('span', 'ps-flag is-live', 'LIVE'));
    else if (s.isNext) flags.appendChild(el('span', 'ps-flag is-next', 'UP NEXT'));
    if (day.multiRoom) flags.appendChild(el('span', 'ps-room', s.room));
    if (showTrackChips && s.track) {
      var chip = el('span', 'ps-track', s.track);
      if (s.trackColor) chip.style.backgroundColor = s.trackColor;
      flags.appendChild(chip);
    }
    if (flags.childNodes.length) info.appendChild(flags);

    if (safeTalkLink(s.url)) {
      var title = el('a', 'ps-title', s.title);
      title.setAttribute('href', s.url);
      title.setAttribute('rel', 'noopener');
      info.appendChild(title);
    } else {
      info.appendChild(el('div', 'ps-title', s.title));
    }

    if (s.body) {
      info.appendChild(el('p', 'ps-abstract', s.body));
      if (s.body.length > CLAMP_CHARS && safeTalkLink(s.url)) {
        var det = el('a', 'ps-details', 'Details ↗');
        det.setAttribute('href', s.url);
        det.setAttribute('rel', 'noopener');
        info.appendChild(det);
      }
    }

    if (s.speakers.length) {
      info.appendChild(el('div', 'ps-speakers', s.speakers.join(', ')));
    }

    card.appendChild(info);
    return card;
  }

  function durationLabel(s) {
    var mins = Math.round((s.endInstant.getTime() - s.startInstant.getTime()) / 60000);
    return mins + ' min';
  }

  function renderSchedule(root, vm) {
    clear(root);
    var activeIndex = pickDefaultDayIndex(vm, new Date());

    var tabs = el('div', 'ps-tabs');
    tabs.setAttribute('role', 'tablist');
    var panels = [];

    vm.days.forEach(function (day, i) {
      var tab = el('button', 'ps-tab' + (i === activeIndex ? ' is-active' : ''));
      tab.setAttribute('type', 'button');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
      var parts = day.label.split(', ');
      tab.appendChild(el('b', null, parts[0]));        // weekday
      tab.appendChild(document.createTextNode(parts[1] || day.label)); // "Month D"
      tab.addEventListener('click', function () { activate(i); });
      tabs.appendChild(tab);

      var panel = el('section', 'ps-day' + (i === activeIndex ? ' is-active' : ''));
      panel.setAttribute('role', 'tabpanel');
      if (i !== activeIndex) panel.setAttribute('hidden', '');

      var metaText = day.sessions.length + (day.sessions.length === 1 ? ' session' : ' sessions');
      if (day.roomName) metaText += ' · ' + day.roomName;
      metaText += ' · all times Pacific';
      panel.appendChild(el('div', 'ps-daymeta', metaText));

      day.sessions.forEach(function (s) { panel.appendChild(renderCard(s, day, vm.showTrackChips)); });
      panels.push(panel);
    });

    function activate(idx) {
      var tabEls = tabs.querySelectorAll('.ps-tab');
      for (var i = 0; i < tabEls.length; i++) {
        var on = i === idx;
        tabEls[i].classList.toggle('is-active', on);
        tabEls[i].setAttribute('aria-selected', on ? 'true' : 'false');
        panels[i].classList.toggle('is-active', on);
        if (on) panels[i].removeAttribute('hidden'); else panels[i].setAttribute('hidden', '');
      }
    }

    root.appendChild(tabs);
    panels.forEach(function (p) { root.appendChild(p); });
  }

  function init() {
    var root = document.querySelector('.pretalx-schedule[data-schedule-url]');
    if (!root) return;
    var url = root.getAttribute('data-schedule-url');
    var tz = root.getAttribute('data-timezone') || 'America/Los_Angeles';
    var publicUrl = root.getAttribute('data-public-url') || url;

    showLoading(root);
    fetch(url, { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        var vm = annotateLiveNext(buildViewModel(json, tz), new Date());
        if (!vm.days.length) { showEmpty(root); return; }
        renderSchedule(root, vm);
      })
      .catch(function () { showError(root, publicUrl); });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
```

- [ ] **Step 2: Syntax-check the script**

Run:
```bash
nix shell nixpkgs#nodejs --command node --check static/js/schedule.js
```
Expected: no output, exit 0 (valid syntax).

- [ ] **Step 3: Verify the unit tests still pass (no regression in the pure layer)**

Run:
```bash
nix shell nixpkgs#nodejs --command node --test tests/schedule.test.js
```
Expected: `# pass 11`, `# fail 0`.

- [ ] **Step 4: Commit**

```bash
git add static/js/schedule.js
git commit -m "schedule: add browser DOM renderer, state handling, and bootstrap"
```

---

## Task 7: SCSS for the day-tabs + cards layout

Adds the namespaced styles for the renderer's DOM and wires the partial into the stylesheet. Verified by compiling and checking the class names appear in the built `style.css`.

**Files:**
- Create: `sass/components/schedule-pretalx.scss`
- Modify: `sass/style.scss` (add `@import`)

- [ ] **Step 1: Create the SCSS partial**

Create `sass/components/schedule-pretalx.scss`:
```scss
.pretalx-schedule {
  display: block;

  .ps-loading,
  .ps-empty,
  .ps-error {
    background: #202024;
    border: 1px solid #2e2e33;
    border-radius: 12px;
    padding: 1.5rem;
    color: #b9bcc2;
  }
  .ps-error a,
  .ps-empty a { color: #66ccee; }

  // tabs
  .ps-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;
    border-bottom: 1px solid #2c2c2e;
    margin-bottom: 0.2rem;
  }
  .ps-tab {
    appearance: none;
    background: transparent;
    border: 0;
    border-bottom: 2px solid transparent;
    color: #9aa0a6;
    cursor: pointer;
    font: inherit;
    padding: 0.55rem 0.95rem 0.6rem;
  }
  .ps-tab b {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6f747a;
  }
  .ps-tab.is-active {
    color: #fff;
    font-weight: 700;
    border-bottom-color: #e0287d;
  }
  .ps-tab.is-active b { color: #e0287d; }

  .ps-daymeta {
    color: #7d8288;
    font-size: 0.8rem;
    margin: 0.7rem 0 1.1rem;
  }

  .ps-day { display: none; }
  .ps-day.is-active { display: block; }

  // card
  .ps-card {
    display: grid;
    grid-template-columns: 96px 1fr;
    gap: 1rem;
    background: #202024;
    border: 1px solid #2e2e33;
    border-radius: 11px;
    padding: 0.95rem 1.05rem;
    margin-bottom: 0.85rem;
  }
  .ps-card.is-next { box-shadow: inset 3px 0 0 #33d17a; }
  .ps-card.is-live { box-shadow: inset 3px 0 0 #e0287d; }

  .ps-time { border-right: 1px solid #34343a; padding-right: 0.7rem; }
  .ps-start { display: block; color: #66ccee; font-size: 1.35rem; font-weight: 800; line-height: 1; }
  .ps-end { color: #7d8288; font-size: 0.8rem; }
  .ps-dur { display: block; color: #5a5e63; font-size: 0.7rem; margin-top: 0.35rem; }

  .ps-flags { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin-bottom: 0.35rem; }
  .ps-flag {
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #0c0c0d;
    border-radius: 4px;
    padding: 0.12rem 0.4rem;
  }
  .ps-flag.is-live { background: #e0287d; color: #fff; }
  .ps-flag.is-next { background: #33d17a; }
  .ps-room {
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #66ccee;
    border: 1px solid rgba(102, 204, 238, 0.4);
    border-radius: 999px;
    padding: 0.1rem 0.5rem;
  }
  .ps-track {
    font-size: 0.66rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #fff;
    background: #444;
    border-radius: 4px;
    padding: 0.12rem 0.45rem;
    font-weight: 700;
  }

  .ps-title {
    display: inline-block;
    color: #fff;
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.22;
    margin: 0.05rem 0 0.4rem;
    text-decoration: none;
  }
  a.ps-title:hover { color: #66ccee; }

  .ps-abstract {
    color: #b9bcc2;
    font-size: 0.86rem;
    line-height: 1.4;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .ps-details { display: inline-block; margin-top: 0.4rem; color: #66ccee; font-size: 0.78rem; }
  .ps-speakers { margin-top: 0.5rem; color: #cfd2d6; font-size: 0.82rem; }
}

@media screen and (max-width: 768px) {
  .pretalx-schedule {
    padding: 0 2ch;
    .ps-card { grid-template-columns: 72px 1fr; gap: 0.7rem; }
    .ps-start { font-size: 1.15rem; }
  }
}
```

- [ ] **Step 2: Wire the partial into the stylesheet**

Edit `sass/style.scss` — add this line in the `@import` block, immediately after the existing `@import './components/schedule.scss';`:
```scss
@import './components/schedule-pretalx.scss';
```

- [ ] **Step 3: Build and verify the styles compile and ship**

Run:
```bash
nix develop -c zola build
grep -c "pretalx-schedule" public/style.css
```
Expected: build succeeds; grep count > 0 (the new rules are in the compiled CSS).

- [ ] **Step 4: Commit**

```bash
git add sass/components/schedule-pretalx.scss sass/style.scss
git commit -m "schedule: add day-tabs + cards styles for the pretalx renderer"
```

---

## Task 8: pretalx template shell, flip 2026, scaffold default — full integration

Creates the client-side shell template, switches the 2026 page to it, points the new-year scaffold at it, and performs the end-to-end browser verification from the spec.

**Files:**
- Create: `templates/schedule-pretalx.html`
- Modify: `content/2026/schedule.md:2`
- Modify: `script/year-template/schedule.md:2`

**Interfaces:**
- Consumes: `static/js/schedule.js` (served at `/js/schedule.js`); the `.pretalx-schedule[data-*]` DOM contract from Task 6; styles from Task 7.

- [ ] **Step 1: Create the shell template**

Create `templates/schedule-pretalx.html`:
```html
{% import "macros/year.html" as year_macros %}
{% extends 'base.html' %} {% block content %}

{% set year = year_macros::year_of_page(page=page) | trim %}
{{ page.content | safe }}

<nav class="schedule-navigation">
  <div class="left">
    <h2>Schedule</h2>
  </div>
</nav>

<div class="pretalx-schedule"
     data-schedule-url="https://cfp.nix.vegas/{{ year }}/schedule/export/schedule.json"
     data-public-url="https://cfp.nix.vegas/{{ year }}/schedule/"
     data-timezone="{{ config.extra.timezone }}">
  <div class="ps-loading">Loading schedule…</div>
  <noscript>
    <div class="ps-error">
      <h2>Schedule</h2>
      <p>This schedule needs JavaScript. <a href="https://cfp.nix.vegas/{{ year }}/schedule/" rel="noopener">View it on pretalx ↗</a></p>
    </div>
  </noscript>
</div>

<script defer src="/js/schedule.js"></script>

{% endblock %}
```

- [ ] **Step 2: Flip the 2026 page to the pretalx template**

Edit `content/2026/schedule.md` — change line 2 to `template: "schedule-pretalx.html"`. Full file:
```yaml
---
template: "schedule-pretalx.html"
title: "Schedule"
---
```

- [ ] **Step 3: Point the new-year scaffold at the pretalx template**

Edit `script/year-template/schedule.md` — change line 2 to `template: "schedule-pretalx.html"`. Full file:
```yaml
---
template: "schedule-pretalx.html"
title: "Schedule"
---
```

- [ ] **Step 4: Build the site**

Run:
```bash
nix develop -c zola build
```
Expected: build succeeds. Confirm the page wires up the script and container:
```bash
grep -c "pretalx-schedule" public/2026/schedule/index.html   # expect 1
grep -c "/js/schedule.js" public/2026/schedule/index.html      # expect 1
```

- [ ] **Step 5: Browser verification (the core end-to-end check)**

Run a local server:
```bash
nix develop -c zola serve
```
In a browser at `http://127.0.0.1:1111/2026/schedule/`, confirm:
- Day tabs render with real weekdays (Fri/Sat/Sun for the populated days); the live data currently has one room (Main Stage), one track (Events) → **no track chips**, room shown once in the day-meta line, **no per-card room badge**.
- Card times show in **Pacific** (e.g. Opening Ceremony 10:00 – 10:30).
- Clicking a tab switches days; only one day's cards are visible.
- Talk titles link to `https://cfp.nix.vegas/2026/talk/…`.
- `/2025/schedule/` still renders the Sessionize server-side schedule unchanged.

- [ ] **Step 6: Verify the error fallback**

Temporarily break the endpoint to exercise the error path: in the browser devtools console on the page, run:
```js
document.querySelector('.pretalx-schedule').setAttribute('data-schedule-url','https://cfp.nix.vegas/nope.json');
```
then reload after also editing the attribute server-side is not needed — instead, simplest: stop `zola serve`, temporarily edit `templates/schedule-pretalx.html` `data-schedule-url` to `https://cfp.nix.vegas/does-not-exist.json`, rebuild/serve, reload, and confirm the **"Schedule unavailable" + "View it on pretalx ↗"** error state appears. **Revert the template edit afterward** and rebuild.

- [ ] **Step 7: Verify the Nix build (no build-time network introduced)**

Run:
```bash
nix build
```
Expected: succeeds (the site derivation still only runs `zola build`; no network needed).

- [ ] **Step 8: Final regression + syntax gates**

Run:
```bash
nix shell nixpkgs#nodejs --command node --test tests/schedule.test.js
nix shell nixpkgs#nodejs --command node --check static/js/schedule.js
```
Expected: `# pass 11`, `# fail 0`; `node --check` exits 0.

- [ ] **Step 9: Commit**

```bash
git add templates/schedule-pretalx.html content/2026/schedule.md script/year-template/schedule.md
git commit -m "schedule: render 2026 from pretalx via client-side schedule-pretalx template"
```

---

## Self-Review

**1. Spec coverage**

| Spec item | Task |
|---|---|
| Client-side fetch on page load | Task 6 (bootstrap), Task 8 (wired via template) |
| CORS (credential-less fetch) | Task 6 (`fetch(url, {credentials:'omit'})`) |
| Per-tool templates; rename `schedule.html` → `schedule-sessionize.html` | Task 1 |
| New `schedule-pretalx.html`; year picks via `template:` | Task 8 |
| 2025 unchanged | Task 1 (Step 4 check), Task 8 (Step 5 check) |
| Scaffold defaults to pretalx | Task 8 |
| URL derived from year (+ public fallback) | Task 8 (template `data-*`) |
| Data transform (days/rooms/sessions, end=start+duration, persons→names, desc‖abstract, track color, sort, skip empties) | Task 4 |
| Day-label UTC pitfall | Task 3 (test) + Task 4 (`formatDayLabel` on a session instant) |
| Layout B: tabs, day meta, card (time/title link/clamp/Details/speakers) | Task 6 + Task 7 |
| Track chip only when >1 track | Task 4 (`showTrackChips`) + Task 6 (render gate) |
| Per-card room badge only when >1 room/day | Task 4 (`multiRoom`) + Task 6 |
| Live / up-next at load | Task 5 + Task 6 |
| Default active day | Task 5 (`pickDefaultDayIndex`) + Task 6 |
| States: loading / empty / error / noscript | Task 6 (JS states) + Task 8 (`<noscript>`) |
| Timezone display + comparison rules | Task 3 + Task 5 |
| Security (textContent only; https cfp link; rel=noopener) | Task 6 (`el()`, `safeTalkLink`) |
| Verification plan | Task 8 (Steps 5–8) |

**2. Placeholder scan:** No `TODO`/`TBD`/"handle edge cases"/"write tests for the above"/stubs remain — every implementation and test step shows the complete code verbatim.

**3. Type consistency:** Function names and signatures are consistent across tasks: `buildViewModel` returns `{ showTrackChips, days, tz }` (tz added in Task 5 and consumed by `pickDefaultDayIndex`/`dateKeyForDefault`); `annotateLiveNext(vm, now)` and `pickDefaultDayIndex(vm, now)` take the same `vm`. DOM class names in Task 6 (`.ps-*`) match the SCSS selectors in Task 7 exactly. The `data-*` attribute names in Task 8's template (`data-schedule-url`/`data-public-url`/`data-timezone`) match the `init()` reads in Task 6.

**Note for the implementer (verification honesty):** Tasks 2–5 are genuinely unit-tested. Task 6's renderer/bootstrap is **browser code** — it is only statically gated (`node --check`) until the **manual browser checks in Task 8 (Steps 5–6)**. We deliberately do *not* add a headless-DOM test (jsdom/puppeteer) because that violates the no-dependencies constraint. Do not report the renderer as "working" until Task 8's browser verification is actually performed.
