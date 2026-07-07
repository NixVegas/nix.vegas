# 2026 Speakers — pretalx Card Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the live 2026 speakers on `/2026/speakers/` as a card grid fetched client-side from the pretalx API, with per-CFP-tool templates that leave the 2025 archive byte-identical.

**Architecture:** Mirrors the 2026 schedule page: a Zola template shell emits a `data-*`-attributed container plus loading/noscript states; a single vanilla-JS deferred script fetches the pretalx speakers API (paginated) and the schedule export in parallel, joins submission codes to talk titles, and renders a card grid; a namespaced sass partial styles it. Spec: `docs/superpowers/specs/2026-07-06-2026-speakers-pretalx-design.md`.

**Tech Stack:** Zola (Tera templates, sass), vanilla JS (no bundler), `node:test` for pure-helper tests, nix dev shell (`nix develop`) provides `zola` and `node`.

## Global Constraints

- **No build-time network.** Netlify runs `zola build`; the Nix derivation builds in a sandbox. All pretalx fetching happens in the browser.
- **JS style (match `static/js/schedule.js`):** one classic script in an IIFE, `'use strict'`, no imports/bundler, loaded with `defer`; pure helpers exported via `module.exports` guard for Node tests; browser bootstrap only runs when `document` exists.
- **Security:** DOM built only via `createElement`/`textContent` — never `innerHTML` with fetched strings. Fetched `href`/`src` values render only when they start with `https://cfp.nix.vegas/`. All outbound links get `rel="noopener"`. `fetch` is credential-less (`credentials: 'omit'`).
- **Styles** namespaced under `.pretalx-speakers` with a `pspk-` class prefix (pattern: `.pretalx-schedule`/`ps-`).
- **2025 archive:** `/2025/speakers/` output must stay byte-for-byte identical.
- **Tests:** run with `nix develop --command node --test tests/` (all) or `... tests/speakers.test.js` (one file).
- **Commits:** repo style `area: lowercase imperative summary`. Never add Co-Authored-By or any AI trailer.
- Palette (from `schedule-pretalx.scss`): card bg `#202024`, border `#2e2e33`, body text `#b9bcc2`, muted `#7d8288`, white titles, cyan links `#66ccee`, pink accent `#e0287d`.

---

### Task 1: Per-CFP-tool rename of the speakers template

**Files:**
- Rename: `templates/speakers.html` → `templates/speakers-sessionize.html` (contents unchanged)
- Modify: `content/2025/speakers.md` (front matter, 1 line)
- Modify: `content/2026/speakers.md` (front matter, 1 line — temporarily also sessionize; Task 5 switches it to pretalx)

**Interfaces:**
- Consumes: nothing.
- Produces: the name `speakers-sessionize.html`, referenced by both years' `speakers.md` until Task 5.

- [ ] **Step 1: Capture the 2025 baseline output**

```bash
nix develop --command zola build
cp public/2025/speakers/index.html /tmp/speakers-2025-baseline.html
```

Expected: build ends with `Done in …ms`; file copied.

- [ ] **Step 2: Rename the template**

```bash
git mv templates/speakers.html templates/speakers-sessionize.html
```

- [ ] **Step 3: Point both years at the renamed template**

`content/2025/speakers.md` and `content/2026/speakers.md` currently both read:

```markdown
---
template: "speakers.html"
title: "Speakers"
---
```

Change the `template:` line in **both** files to:

```markdown
template: "speakers-sessionize.html"
```

- [ ] **Step 4: Verify the build passes and 2025 output is byte-identical**

```bash
nix develop --command zola build
diff /tmp/speakers-2025-baseline.html public/2025/speakers/index.html
```

Expected: build succeeds; `diff` prints nothing (exit 0).

- [ ] **Step 5: Commit**

```bash
git add templates/speakers-sessionize.html content/2025/speakers.md content/2026/speakers.md
git commit -m "templates: split speakers into per-CFP-tool speakers-sessionize.html"
```

---

### Task 2: `speakers.js` pure helpers, TDD

**Files:**
- Create: `tests/fixtures/pretalx-speakers.json`
- Create: `tests/speakers.test.js`
- Create: `static/js/speakers.js` (pure-helper half; browser half arrives in Task 3)

**Interfaces:**
- Consumes: nothing.
- Produces (module exports, used by Task 3's browser code and these tests):
  - `normalizeBio(biography) -> string` (trimmed; `''` for null/non-string)
  - `talkMap(scheduleJson|null) -> { [code]: {title, url} }`
  - `buildSpeakersViewModel(results, scheduleJson|null) -> [{code, name, bio, avatarUrl, talks:[{title,url}]}]` sorted case-insensitively by name
  - `initialLetter(name) -> string` (single uppercase char, `'?'` fallback)
  - `safeCfpUrl(url) -> boolean` (`https://cfp.nix.vegas/` prefix)
  - `fetchAllSpeakers(fetchFn, url, maxPages) -> Promise<results[]>` (follows `next`, hard page cap, rejects on HTTP error)

- [ ] **Step 1: Create the API-page fixture**

Create `tests/fixtures/pretalx-speakers.json` (shape captured from the live `/api/events/2026/speakers/` endpoint; covers: null bio, whitespace bio, kept "." bio, missing avatar, present avatar, unscheduled submission, multi-submission, mixed-case sort):

```json
{
  "count": 4,
  "next": null,
  "previous": null,
  "results": [
    {
      "code": "ZZ9PZA",
      "name": "zoe lastalpha",
      "biography": null,
      "submissions": ["NOSCHED"],
      "avatar_url": null,
      "answers": []
    },
    {
      "code": "9HRPTA",
      "name": "Aaron Honeycutt",
      "biography": "a computer nerd who happens to use Linux",
      "submissions": ["AHEHMM"],
      "avatar_url": "https://cfp.nix.vegas/media/avatars/B97ED8_bgZVxIc.webp",
      "answers": []
    },
    {
      "code": "JYC9UR",
      "name": "Daniel Baker",
      "biography": "   ",
      "submissions": ["VDYEYG"],
      "avatar_url": null,
      "answers": []
    },
    {
      "code": "77M3KN",
      "name": "morgan jones",
      "biography": ".",
      "submissions": ["VDYEYG", "NOSCHED"],
      "avatar_url": null,
      "answers": []
    }
  ]
}
```

- [ ] **Step 2: Write the failing tests**

Create `tests/speakers.test.js`:

```js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const S = require('../static/js/speakers.js');
const PAGE = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/pretalx-speakers.json'), 'utf8'));

// Minimal schedule export: only the fields talkMap consumes.
const SCHEDULE = { schedule: { conference: { days: [
  { rooms: { 'Main Stage': [
    { code: 'VDYEYG', title: 'Nix Vegas Opening Ceremony', url: 'https://cfp.nix.vegas/2026/talk/VDYEYG/' },
    { code: 'AHEHMM', title: 'Running a homelab with NixOS', url: 'https://cfp.nix.vegas/2026/talk/AHEHMM/' }
  ] } },
  { rooms: {} }
] } } };

test('normalizeBio trims and blanks null/whitespace, keeps real text', () => {
  assert.strictEqual(S.normalizeBio(null), '');
  assert.strictEqual(S.normalizeBio(undefined), '');
  assert.strictEqual(S.normalizeBio('   '), '');
  assert.strictEqual(S.normalizeBio('  hi there '), 'hi there');
  assert.strictEqual(S.normalizeBio('.'), '.'); // no content filtering beyond empties
});

test('talkMap indexes scheduled talks by code and tolerates empty/missing input', () => {
  const map = S.talkMap(SCHEDULE);
  assert.deepStrictEqual(map.VDYEYG, { title: 'Nix Vegas Opening Ceremony', url: 'https://cfp.nix.vegas/2026/talk/VDYEYG/' });
  assert.deepStrictEqual(map.AHEHMM, { title: 'Running a homelab with NixOS', url: 'https://cfp.nix.vegas/2026/talk/AHEHMM/' });
  assert.strictEqual(Object.keys(map).length, 2);
  assert.deepStrictEqual(S.talkMap(null), {});
  assert.deepStrictEqual(S.talkMap({}), {});
});

test('buildSpeakersViewModel sorts case-insensitively and joins talks', () => {
  const vm = S.buildSpeakersViewModel(PAGE.results, SCHEDULE);
  assert.deepStrictEqual(vm.map(s => s.name),
    ['Aaron Honeycutt', 'Daniel Baker', 'morgan jones', 'zoe lastalpha']);

  const aaron = vm[0];
  assert.strictEqual(aaron.code, '9HRPTA');
  assert.strictEqual(aaron.bio, 'a computer nerd who happens to use Linux');
  assert.strictEqual(aaron.avatarUrl, 'https://cfp.nix.vegas/media/avatars/B97ED8_bgZVxIc.webp');
  assert.deepStrictEqual(aaron.talks.map(t => t.title), ['Running a homelab with NixOS']);

  const daniel = vm[1];
  assert.strictEqual(daniel.bio, '');            // whitespace bio blanked
  assert.strictEqual(daniel.avatarUrl, null);

  const morgan = vm[2];
  assert.strictEqual(morgan.bio, '.');
  // NOSCHED isn't on the schedule -> contributes no talk row
  assert.deepStrictEqual(morgan.talks.map(t => t.title), ['Nix Vegas Opening Ceremony']);

  assert.deepStrictEqual(vm[3].talks, []);       // only unscheduled submissions
});

test('buildSpeakersViewModel degrades without a schedule (no talk rows)', () => {
  const vm = S.buildSpeakersViewModel(PAGE.results, null);
  assert.strictEqual(vm.length, 4);
  vm.forEach(s => assert.deepStrictEqual(s.talks, []));
});

test('initialLetter uppercases the first character, ? fallback', () => {
  assert.strictEqual(S.initialLetter('aaron'), 'A');
  assert.strictEqual(S.initialLetter('  jb'), 'J');
  assert.strictEqual(S.initialLetter(''), '?');
  assert.strictEqual(S.initialLetter(null), '?');
});

test('safeCfpUrl only accepts https cfp.nix.vegas URLs', () => {
  assert.strictEqual(S.safeCfpUrl('https://cfp.nix.vegas/2026/talk/X/'), true);
  assert.strictEqual(S.safeCfpUrl('http://cfp.nix.vegas/2026/talk/X/'), false);
  assert.strictEqual(S.safeCfpUrl('https://evil.example/https://cfp.nix.vegas/'), false);
  assert.strictEqual(S.safeCfpUrl(null), false);
});

function stubFetch(pages) {
  return function (url) {
    const page = pages[url];
    if (!page) return Promise.resolve({ ok: false, status: 404 });
    return Promise.resolve({ ok: true, json: () => Promise.resolve(page) });
  };
}

test('fetchAllSpeakers follows next links and concatenates results', async () => {
  const pages = {
    'https://x/1': { count: 3, next: 'https://x/2', results: [{ code: 'A' }, { code: 'B' }] },
    'https://x/2': { count: 3, next: null, results: [{ code: 'C' }] }
  };
  const res = await S.fetchAllSpeakers(stubFetch(pages), 'https://x/1', 10);
  assert.deepStrictEqual(res.map(r => r.code), ['A', 'B', 'C']);
});

test('fetchAllSpeakers stops at the page cap and returns what it has', async () => {
  const pages = { 'https://x/loop': { next: 'https://x/loop', results: [{ code: 'X' }] } };
  const res = await S.fetchAllSpeakers(stubFetch(pages), 'https://x/loop', 3);
  assert.strictEqual(res.length, 3);
});

test('fetchAllSpeakers rejects on HTTP error', async () => {
  const f = () => Promise.resolve({ ok: false, status: 500 });
  await assert.rejects(S.fetchAllSpeakers(f, 'https://x/1', 10), /HTTP 500/);
});
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
nix develop --command node --test tests/speakers.test.js
```

Expected: FAIL — `Cannot find module '../static/js/speakers.js'`.

- [ ] **Step 4: Write the pure-helper half of `static/js/speakers.js`**

Create `static/js/speakers.js`:

```js
/* Nix Vegas speakers renderer — fetches the pretalx speakers API and renders a
   card grid. Single classic script (no bundler/imports). Pure functions are
   exported for Node unit tests; browser bootstrap runs only when a document is
   present. */
(function () {
  'use strict';

  // ---- pure helpers ----

  function normalizeBio(biography) {
    if (typeof biography !== 'string') return '';
    return biography.trim();
  }

  function talkMap(scheduleJson) {
    var map = {};
    var conf = scheduleJson && scheduleJson.schedule && scheduleJson.schedule.conference;
    ((conf && conf.days) || []).forEach(function (day) {
      var rooms = day.rooms || {};
      Object.keys(rooms).forEach(function (roomName) {
        (rooms[roomName] || []).forEach(function (t) {
          if (t.code) map[t.code] = { title: t.title, url: t.url };
        });
      });
    });
    return map;
  }

  function buildSpeakersViewModel(results, scheduleJson) {
    var talks = talkMap(scheduleJson);
    var speakers = (results || []).map(function (s) {
      return {
        code: s.code,
        name: s.name || '',
        bio: normalizeBio(s.biography),
        avatarUrl: typeof s.avatar_url === 'string' ? s.avatar_url : null,
        talks: (s.submissions || [])
          .map(function (c) { return talks[c]; })
          .filter(Boolean)
      };
    });
    speakers.sort(function (a, b) {
      return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    });
    return speakers;
  }

  function initialLetter(name) {
    var t = String(name || '').trim();
    return t ? t.charAt(0).toUpperCase() : '?';
  }

  function safeCfpUrl(url) {
    return typeof url === 'string' && url.indexOf('https://cfp.nix.vegas/') === 0;
  }

  // Follow the API's `next` links, hard-capped as a runaway guard; the page
  // renders whatever was fetched if the cap is ever hit. `fetchFn` is injected
  // so tests can stub the network.
  function fetchAllSpeakers(fetchFn, url, maxPages) {
    var results = [];
    var pages = 0;
    function step(u) {
      pages += 1;
      return fetchFn(u, { credentials: 'omit' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (json) {
          results = results.concat(json.results || []);
          if (json.next && pages < maxPages) return step(json.next);
          return results;
        });
    }
    return step(url);
  }

  // ---- Node export (browser leaves `module` undefined) ----
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      normalizeBio, talkMap, buildSpeakersViewModel,
      initialLetter, safeCfpUrl, fetchAllSpeakers
    };
  }
})();
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
nix develop --command node --test tests/speakers.test.js
```

Expected: PASS — 9 tests, 0 failures. Also run the whole suite to confirm nothing else broke:

```bash
nix develop --command node --test tests/
```

Expected: PASS (schedule tests + speakers tests).

- [ ] **Step 6: Commit**

```bash
git add tests/fixtures/pretalx-speakers.json tests/speakers.test.js static/js/speakers.js
git commit -m "speakers: add pretalx view-model helpers with tests"
```

---

### Task 3: Browser rendering + bootstrap in `speakers.js`

**Files:**
- Modify: `static/js/speakers.js` (insert browser section between the pure helpers and the Node-export block)

**Interfaces:**
- Consumes: Task 2's helpers (`buildSpeakersViewModel`, `initialLetter`, `safeCfpUrl`, `fetchAllSpeakers`).
- Produces: DOM classes consumed by Task 4's sass and Task 5's shell — container selector `.pretalx-speakers[data-speakers-url]`; classes `pspk-loading`, `pspk-empty`, `pspk-error`, `pspk-grid`, `pspk-card`, `pspk-avatar`, `pspk-avatar-placeholder`, `pspk-name`, `pspk-bio`, `pspk-talks`, `pspk-talk`. Reads attributes `data-speakers-url`, `data-schedule-url`, `data-public-url`.

- [ ] **Step 1: Insert the browser-only section**

In `static/js/speakers.js`, insert the following **between** `fetchAllSpeakers` and the `// ---- Node export` comment:

```js
  // ---- browser-only rendering ----

  var MAX_PAGES = 10;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function showLoading(root) {
    clear(root);
    root.appendChild(el('div', 'pspk-loading', 'Loading speakers…'));
  }

  function showEmpty(root) {
    clear(root);
    var box = el('div', 'pspk-empty');
    box.appendChild(el('h2', null, 'Coming soon'));
    box.appendChild(el('p', null, 'Speakers are still being announced. Check back closer to the conference.'));
    root.appendChild(box);
  }

  function showError(root, publicUrl) {
    clear(root);
    var box = el('div', 'pspk-error');
    box.appendChild(el('h2', null, 'Speakers unavailable'));
    var p = el('p', null, "We couldn't load the speaker list right now. ");
    var a = el('a', null, 'View the speaker list on pretalx ↗');
    a.setAttribute('href', publicUrl);
    a.setAttribute('rel', 'noopener');
    p.appendChild(a);
    box.appendChild(p);
    root.appendChild(box);
  }

  function renderCard(s, publicUrl) {
    var card = el('div', 'pspk-card');

    if (s.avatarUrl && safeCfpUrl(s.avatarUrl)) {
      var img = el('img', 'pspk-avatar');
      img.setAttribute('src', s.avatarUrl);
      img.setAttribute('alt', s.name);
      img.setAttribute('loading', 'lazy');
      card.appendChild(img);
    } else {
      var ph = el('div', 'pspk-avatar pspk-avatar-placeholder', initialLetter(s.name));
      ph.setAttribute('aria-hidden', 'true');
      card.appendChild(ph);
    }

    // Profile URL is constructed from the trusted base + the speaker code
    // (never taken from fetched data), per the spec's security rules.
    var name = el('a', 'pspk-name', s.name);
    name.setAttribute('href', publicUrl + encodeURIComponent(s.code) + '/');
    name.setAttribute('rel', 'noopener');
    card.appendChild(name);

    if (s.bio) card.appendChild(el('p', 'pspk-bio', s.bio));

    if (s.talks.length) {
      var list = el('ul', 'pspk-talks');
      s.talks.forEach(function (t) {
        var li = el('li', 'pspk-talk');
        if (safeCfpUrl(t.url)) {
          var a = el('a', null, t.title);
          a.setAttribute('href', t.url);
          a.setAttribute('rel', 'noopener');
          li.appendChild(a);
        } else {
          li.textContent = t.title;
        }
        list.appendChild(li);
      });
      card.appendChild(list);
    }

    return card;
  }

  function renderSpeakers(root, speakers, publicUrl) {
    clear(root);
    var grid = el('div', 'pspk-grid');
    speakers.forEach(function (s) { grid.appendChild(renderCard(s, publicUrl)); });
    root.appendChild(grid);
  }

  function init() {
    var root = document.querySelector('.pretalx-speakers[data-speakers-url]');
    if (!root) return;
    var speakersUrl = root.getAttribute('data-speakers-url');
    var scheduleUrl = root.getAttribute('data-schedule-url');
    var publicUrl = root.getAttribute('data-public-url');

    showLoading(root);
    var speakersP = fetchAllSpeakers(window.fetch.bind(window), speakersUrl, MAX_PAGES);
    var scheduleP = fetch(scheduleUrl, { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(function () { return null; }); // degrade: cards render without talk rows

    Promise.all([speakersP, scheduleP])
      .then(function (res) {
        var speakers = buildSpeakersViewModel(res[0], res[1]);
        if (!speakers.length) { showEmpty(root); return; }
        renderSpeakers(root, speakers, publicUrl);
      })
      .catch(function () { showError(root, publicUrl); });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
```

- [ ] **Step 2: Run the full test suite (exports unchanged, nothing regresses)**

```bash
nix develop --command node --test tests/
```

Expected: PASS. (The browser section is inert in Node because `document` is undefined.)

- [ ] **Step 3: Commit**

```bash
git add static/js/speakers.js
git commit -m "speakers: render the pretalx card grid in the browser"
```

---

### Task 4: Card-grid styles

**Files:**
- Create: `sass/components/speakers-pretalx.scss`
- Modify: `sass/style.scss` (one `@import` line)

**Interfaces:**
- Consumes: Task 3's class names (`.pretalx-speakers`, `pspk-*`).
- Produces: compiled styles in `public/style.css`.

- [ ] **Step 1: Create `sass/components/speakers-pretalx.scss`**

```scss
.pretalx-speakers {
  display: block;

  .pspk-loading,
  .pspk-empty,
  .pspk-error {
    background: #202024;
    border: 1px solid #2e2e33;
    border-radius: 12px;
    padding: 1.5rem;
    color: #b9bcc2;
  }
  .pspk-error a,
  .pspk-empty a { color: #66ccee; }

  .pspk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 0.85rem;
  }

  .pspk-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.55rem;
    background: #202024;
    border: 1px solid #2e2e33;
    border-radius: 11px;
    padding: 1.05rem;
    min-width: 0;
  }

  .pspk-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #34343a;
  }
  .pspk-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e0287d;
    color: #fff;
    font-size: 1.6rem;
    font-weight: 800;
  }

  .pspk-name {
    color: #fff;
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.22;
    text-decoration: none;
  }
  a.pspk-name:hover { color: #66ccee; }

  .pspk-bio {
    color: #b9bcc2;
    font-size: 0.86rem;
    line-height: 1.4;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .pspk-talks {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .pspk-talk {
    font-size: 0.82rem;
    line-height: 1.35;
    margin-top: 0.25rem;
    padding-left: 0.9rem;
    position: relative;
  }
  .pspk-talk::before {
    content: '▸';
    position: absolute;
    left: 0;
    color: #e0287d;
  }
  .pspk-talk a { color: #66ccee; text-decoration: none; }
  .pspk-talk a:hover { text-decoration: underline; }
}

@media screen and (max-width: 768px) {
  .pretalx-speakers {
    padding: 0 2ch;
    .pspk-grid { grid-template-columns: 1fr; }
  }
}
```

- [ ] **Step 2: Import it in `sass/style.scss`**

After the line `@import './components/speakers.scss';` add:

```scss
@import './components/speakers-pretalx.scss';
```

- [ ] **Step 3: Verify sass compiles**

```bash
nix develop --command zola build
grep -c "pspk-grid" public/style.css
```

Expected: build succeeds; grep prints a count ≥ 1.

- [ ] **Step 4: Commit**

```bash
git add sass/components/speakers-pretalx.scss sass/style.scss
git commit -m "sass: add pretalx speakers card-grid styles"
```

---

### Task 5: Shell template + switch 2026 and the scaffold to pretalx

**Files:**
- Create: `templates/speakers-pretalx.html`
- Modify: `content/2026/speakers.md` (front matter, 1 line)
- Modify: `script/year-template/speakers.md` (front matter, 1 line)

**Interfaces:**
- Consumes: `static/js/speakers.js` (Task 3), `year_macros::year_of_page` (existing).
- Produces: the live `/2026/speakers/` page shell.

- [ ] **Step 1: Create `templates/speakers-pretalx.html`**

```html
{% import "macros/year.html" as year_macros %}
{% extends 'base.html' %} {% block content %}

{% set year = year_macros::year_of_page(page=page) | trim %}
{{ page.content | safe }}

<div class="pretalx-speakers"
     data-speakers-url="https://cfp.nix.vegas/api/events/{{ year }}/speakers/"
     data-schedule-url="https://cfp.nix.vegas/{{ year }}/schedule/export/schedule.json"
     data-public-url="https://cfp.nix.vegas/{{ year }}/speaker/">
  <div class="pspk-loading">Loading speakers…</div>
  <noscript>
    <div class="pspk-error">
      <h2>Speakers</h2>
      <p>This page needs JavaScript. <a href="https://cfp.nix.vegas/{{ year }}/speaker/" rel="noopener">View the speaker list on pretalx ↗</a></p>
    </div>
  </noscript>
</div>

<script defer src="/js/speakers.js"></script>

{% endblock %}
```

- [ ] **Step 2: Switch 2026 and the year-template scaffold to the pretalx renderer**

In `content/2026/speakers.md` and `script/year-template/speakers.md`, change the `template:` line to:

```markdown
template: "speakers-pretalx.html"
```

(`content/2025/speakers.md` stays on `speakers-sessionize.html`.)

- [ ] **Step 3: Verify the build and the rendered shell**

```bash
nix develop --command zola build
grep -c 'data-speakers-url' public/2026/speakers/index.html
grep -c 'js/speakers.js' public/2026/speakers/index.html
grep -c 'data-speakers-url' public/2025/speakers/index.html || true
```

Expected: build succeeds; first two greps print `1`; the 2025 grep prints `0` (still server-rendered). Note: Tera entity-escapes `/` as `&#x2F;` inside attribute values — that is pre-existing behavior (browsers decode it) and why the greps match attribute names, not URLs.

- [ ] **Step 4: Commit**

```bash
git add templates/speakers-pretalx.html content/2026/speakers.md script/year-template/speakers.md
git commit -m "2026: render speakers from pretalx client-side"
```

---

### Task 6: End-to-end verification (spec's Verification Plan)

**Files:** none (temporary local edits only, reverted before finishing).

**Interfaces:** consumes everything above.

- [ ] **Step 1: Full test suite + clean build**

```bash
nix develop --command node --test tests/
nix develop --command zola build
```

Expected: all tests pass; build succeeds (proves no build-time network was introduced).

- [ ] **Step 2: Live page check**

```bash
nix develop --command zola serve
```

Open `http://127.0.0.1:1111/2026/speakers/` and verify:
- One card per API speaker (currently 6), sorted alphabetically by name.
- Avatars render for speakers that have them (Aaron Honeycutt, JB); pink first-letter placeholders for the rest.
- JB's long bio clamps to 4 lines; speakers with null bios show no bio row.
- Talk titles link to `cfp.nix.vegas` talk pages; speaker names link to their pretalx profiles.
- Narrow the viewport below 768px: the grid collapses to one column.

- [ ] **Step 3: Error state**

Temporarily edit `templates/speakers-pretalx.html`, changing `data-speakers-url` to `https://cfp.invalid/`. Reload: the error box appears with the "View the speaker list on pretalx ↗" fallback link. **Revert the edit.**

- [ ] **Step 4: Partial state (schedule down)**

Temporarily change only `data-schedule-url` to `https://cfp.invalid/`. Reload: cards render normally but without talk rows. **Revert the edit.**

- [ ] **Step 5: 2025 archive parity**

```bash
diff <(git show main:templates/speakers.html) templates/speakers-sessionize.html
diff /tmp/speakers-2025-baseline.html public/2025/speakers/index.html
```

Expected: both `diff`s print nothing (template is a pure rename; built 2025 page is byte-identical).

If `/tmp/speakers-2025-baseline.html` no longer exists (Task 1 ran in an earlier session), rebuild the baseline from `main` instead:

```bash
git worktree add /tmp/nv-main-baseline main
(cd /tmp/nv-main-baseline && nix develop --command zola build)
diff /tmp/nv-main-baseline/public/2025/speakers/index.html public/2025/speakers/index.html
git worktree remove --force /tmp/nv-main-baseline
```

Expected: `diff` prints nothing.

- [ ] **Step 6: Confirm the working tree is clean (temporary edits reverted)**

```bash
git status --short
```

Expected: no output.
