# Site Architecture Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate nix.vegas from "current year at root + ad-hoc archive" to a uniform `/YYYY/` model with an evergreen root page, kill the onsite/offsite build flag, group blog posts by year, and add scaffolding for future-year rollover — all without breaking external links.

**Architecture:** Move all event content under `content/YYYY/`. Replace `current_path` regex with `config.extra.current_year` and `page.ancestors`. New `templates/root.html` for the evergreen landing. 301 redirects preserve old root URLs. A `script/new-year` scaffolding command handles future rollovers.

**Tech Stack:** Zola 0.21.0 (Tera templates), SCSS, Nix flake build, Netlify hosting (consumes `static/_redirects` for redirects).

**Spec:** `docs/superpowers/specs/2026-05-15-site-architecture-design.md`

**Branch:** Work on `site-improvements` (current branch). Each phase is a separate commit; phases 1–3 should ideally land as separate PRs since they change user-visible URL behavior. Phases 4–7 can batch as one or two PRs.

---

## Verification approach

This is a static site. There are no unit tests. Verification per task is one of:

- **Build verification:** `nix build .#default` must succeed.
- **Local dev:** `nix develop -c zola serve` and click through pages.
- **Rendered HTML diff (refactor tasks):** before/after `nix build` outputs are diffed to confirm no unintended change.
- **Redirect verification:** `curl -sI http://localhost:1313/old-path` (or Netlify deploy preview) for 301s.

Always run `nix build .#default` after every task that touches build inputs (content, templates, sass, config, or flake). If the build fails, fix before committing.

---

## Phase 1: Move current-year content into `/2026/`

**Goal of phase:** After this phase, visiting `/about` 301-redirects to `/2026/about` and the existing 2025 archive is untouched. No template logic changes. Internal frontmatter on year sections gains structured event fields.

### Task 1.1: Move current-year content files into `content/2026/`

**Files:**
- Move: `content/_index.md` → `content/2026/_index.md`
- Move: `content/hero.md` → `content/2026/hero.md`
- Move: `content/about/_index.md` → `content/2026/about/_index.md`
- Move: `content/offsite.md` → `content/2026/offsite.md`

- [ ] **Step 1: Create the `content/2026/` and `content/2026/about/` directories.**

```bash
cd /home/djacu/dev/nixvegas/nix.vegas
mkdir -p content/2026/about
```

- [ ] **Step 2: Use `git mv` to move each file. (`git mv` preserves history vs `mv` + `git add`.)**

```bash
git mv content/_index.md content/2026/_index.md
git mv content/hero.md content/2026/hero.md
git mv content/about/_index.md content/2026/about/_index.md
git mv content/offsite.md content/2026/offsite.md
```

- [ ] **Step 3: Verify the move with `git status`. Expect 4 renames, no other changes.**

```bash
git status
```

Expected output snippet:

```
renamed:    content/_index.md -> content/2026/_index.md
renamed:    content/about/_index.md -> content/2026/about/_index.md
renamed:    content/hero.md -> content/2026/hero.md
renamed:    content/offsite.md -> content/2026/offsite.md
```

- [ ] **Step 4: Remove the now-empty `content/about/` directory.**

```bash
rmdir content/about
```

- [ ] **Step 5: Build to confirm nothing is broken.**

```bash
nix build .#default
```

Expected: build succeeds. The current `templates/base.html` uses a regex on `current_path` that matches `/2026/...`, so it should treat 2026 as a year section automatically.

- [ ] **Step 6: Serve and spot-check `/2026/` and `/2026/about`.**

```bash
nix develop -c zola serve
```

Open `http://127.0.0.1:1111/2026/` and `http://127.0.0.1:1111/2026/about` in a browser. Confirm the home and about pages render with 2026 content (DEF CON 34, etc.). Stop the server (Ctrl-C).

- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "content: move 2026 event content under /2026/"
```

---

### Task 1.2: Populate event metadata in 2026 frontmatter

The root landing (added in Phase 2) reads structured fields from year section frontmatter to render the current-event callout. Add those fields now so 2026 is ready when Phase 2 needs them.

**Files:**
- Modify: `content/2026/_index.md`

- [ ] **Step 1: Read the current frontmatter.**

```bash
sed -n '1,15p' content/2026/_index.md
```

Expected: existing `extra:` block with `favicon_*`, `hero_img`, `hero_glitch_imgs: []`.

- [ ] **Step 2: Add event metadata fields under `extra`. The frontmatter should look like:**

```yaml
---
template: "home.html"
title: "Home"

extra:
  favicon_ico: "/img/favicon.ico"
  favicon_16: "/img/favicon-16x16.png"
  favicon_32: "/img/favicon-32x32.png"
  favicon_48: "/img/favicon-48x48.png"
  favicon_512: "/img/favicon.png"
  hero_img: "/img/2025/nix-vegas.png"
  hero_glitch_imgs: []
  event_dates: "August 6–9, 2026"
  event_location: "Las Vegas Convention Center"
  event_defcon: "DEF CON 34"
  event_defcon_url: "https://defcon.org/html/defcon-34/"
  event_tagline: "Agency"
---
```

Use the Edit tool to insert the four new lines after `hero_glitch_imgs: []`.

- [ ] **Step 3: Build to confirm frontmatter parses.**

```bash
nix build .#default
```

Expected: build succeeds.

- [ ] **Step 4: Commit.**

```bash
git add content/2026/_index.md
git commit -m "content: add event metadata to 2026 section frontmatter"
```

---

### Task 1.3: Populate event metadata in 2025 archive frontmatter

Same shape, for the 2025 archive. Frontmatter only — body content of `content/2025/_index.md` is not modified.

**Files:**
- Modify: `content/2025/_index.md`

- [ ] **Step 1: Read the existing 2025 frontmatter.**

```bash
sed -n '1,20p' content/2025/_index.md
```

- [ ] **Step 2: Add event metadata under `extra`. After modification, the frontmatter should look like:**

```yaml
---
template: "home.html"
title: "Home"

extra:
  favicon_ico: "/img/favicon.ico"
  favicon_16: "/img/favicon-16x16.png"
  favicon_32: "/img/favicon-32x32.png"
  favicon_48: "/img/favicon-48x48.png"
  favicon_512: "/img/favicon.png"
  hero_img: "/img/2025/nix-vegas.png"
  hero_glitch_imgs:
    - "/img/2025/nix-vegas-glitched1.png"
    - "/img/2025/nix-vegas-glitched2.png"
    - "/img/2025/nix-vegas-glitched3.png"
    - "/img/2025/nix-vegas-glitched4.png"
    - "/img/2025/nix-vegas-glitched5.png"
  event_dates: "August 7–10, 2025"
  event_location: "Las Vegas Convention Center"
  event_defcon: "DEF CON 33"
  event_defcon_url: "https://defcon.org/html/defcon-33/"
  event_tagline: "Rebuild the World"
---
```

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

- [ ] **Step 4: Commit.**

```bash
git add content/2025/_index.md
git commit -m "content: add event metadata to 2025 section frontmatter"
```

---

### Task 1.4: Add `static/_redirects` with current-year and permanent blog redirects

**Files:**
- Create: `static/_redirects`

- [ ] **Step 1: Create `static/_redirects` with this exact content:**

```
# nix.vegas redirects — consumed by Netlify
#
# The "current-year" block is rewritten by script/new-year when the live event year rolls over.
# Everything below the "permanent" header is hand-maintained.

# BEGIN current-year
/about     /2026/about      301
/schedule  /2026/schedule   301
/speakers  /2026/speakers   301
# END current-year

# Permanent blog redirects (one-time moves from flat /blog/<slug> to /blog/YYYY/<slug>)
/blog/2025-retrospective   /blog/2025/2025-retrospective   301
/blog/artwork              /blog/2025/artwork              301
/blog/sneak-preview        /blog/2025/sneak-preview        301
/blog/dc32-nixmesh         /blog/2025/dc32-nixmesh         301
```

Note: The blog redirects reference paths that won't exist until Phase 3. They're included now because (a) the file is hand-edited rarely and putting all redirects in one place is easier than splitting across phases, (b) until Phase 3 lands these redirects point at 404 destinations, but the *source* paths (`/blog/<slug>` flat) still resolve naturally because Zola is serving them from the flat layout. Netlify only consults `_redirects` when a 404 would otherwise occur, so this is harmless. After Phase 3, the source paths 404 (because posts moved) and the redirects kick in.

Actually verify the above claim: Netlify's `_redirects` rules with `301` are *unconditional* — they fire before checking if the source path exists. To make Phase 1 safe, comment out the blog redirects until Phase 3:

- [ ] **Step 2: Edit `static/_redirects` to comment out the blog redirects for now:**

```
# nix.vegas redirects — consumed by Netlify
#
# The "current-year" block is rewritten by script/new-year when the live event year rolls over.
# Everything below the "permanent" header is hand-maintained.

# BEGIN current-year
/about     /2026/about      301
/schedule  /2026/schedule   301
/speakers  /2026/speakers   301
# END current-year

# Permanent blog redirects (activated in Phase 3 after blog posts move to /blog/YYYY/)
# /blog/2025-retrospective   /blog/2025/2025-retrospective   301
# /blog/artwork              /blog/2025/artwork              301
# /blog/sneak-preview        /blog/2025/sneak-preview        301
# /blog/dc32-nixmesh         /blog/2025/dc32-nixmesh         301
```

- [ ] **Step 3: Build to confirm `static/_redirects` gets copied into the build output.**

```bash
nix build .#default
ls result/public/_redirects
```

Expected: file exists at `result/public/_redirects`.

- [ ] **Step 4: Commit.**

```bash
git add static/_redirects
git commit -m "static: add _redirects with current-year and (commented) blog redirects"
```

---

### Task 1.5: Manual verification of Phase 1

This task has no commit; it's an integration check before moving to Phase 2.

- [ ] **Step 1: Build and serve.**

```bash
nix build .#default
nix develop -c zola serve
```

- [ ] **Step 2: Visit each of these URLs in the browser and confirm:**

| URL | Expected |
|---|---|
| `/` | Renders 2026 home content (this will be replaced in Phase 2). The page shows DEF CON 34 / Agency content from `content/2026/_index.md` because Zola treats `content/2025/` and `content/2026/` as sections under root. Wait — there's no `content/_index.md` after Task 1.1. Need to verify what Zola does. See sub-step 3. |

- [ ] **Step 3: Determine what Zola does without a root `_index.md`.**

Zola requires `content/_index.md` for the root section. With it missing, `zola serve` may error or generate a default index page. If it errors, this is OK — Phase 2 creates the new root file. Document what you see:

```bash
# In another terminal, try:
curl -sI http://127.0.0.1:1111/
```

Three possible outcomes:
- **A. 404.** Acceptable as a transient state between Phase 1 and Phase 2 if Phase 2 is the next merge.
- **B. Zola auto-generates a section page.** Fine as a placeholder.
- **C. Zola errors at build time.** Means Phase 1 cannot ship without Phase 2. In this case, the two phases must merge together.

If outcome is C, plan adjustment: Phase 1 and Phase 2 merge as one PR. Create a stub `content/_index.md` at the end of Phase 1 to unblock the build, then replace it in Phase 2.

- [ ] **Step 4: Test current-year redirect.**

```bash
# Netlify _redirects is only honored by Netlify, not zola serve. To test, use the Netlify CLI if available, or just inspect the file. Note in a comment what you tested.

# Inspect:
cat result/public/_redirects
```

Expected: file contains the BEGIN/END current-year block pointing at 2026.

- [ ] **Step 5: Visit `/2026/` and `/2026/about` to confirm content rendered correctly.**

Stop the server.

Phase 1 complete.

---

## Phase 2: Add evergreen root page

**Goal of phase:** A new `content/_index.md` + `templates/root.html` serve the project landing at `/`. The root has a hero, current-event callout, about-the-community section, recent posts, past events list, and contact/social bar.

### Task 2.1: Create `templates/components/current_event_callout.html`

**Files:**
- Create: `templates/components/current_event_callout.html`

- [ ] **Step 1: Create the file with this content:**

```html
{% set current_year = config.extra.current_year %}
{% set year_section = get_section(path=current_year ~ "/_index.md") %}
<a class="current-event-callout" href="/{{ current_year }}/">
  <div class="current-event-callout-defcon">
    {{ year_section.extra.event_defcon }}
  </div>
  <div class="current-event-callout-dates">
    {{ year_section.extra.event_dates }}
  </div>
  <div class="current-event-callout-location">
    {{ year_section.extra.event_location }}
  </div>
  {% if year_section.extra.event_tagline %}
  <div class="current-event-callout-tagline">
    "{{ year_section.extra.event_tagline }}"
  </div>
  {% endif %}
  <div class="current-event-callout-cta">
    See the event →
  </div>
</a>
```

This component reads `config.extra.current_year` (added in Task 2.2's `config.toml` edit) and pulls structured fields from that year's section frontmatter (added in Task 1.2).

---

### Task 2.2: Add `current_year` to `config.toml`

**Files:**
- Modify: `config.toml`

- [ ] **Step 1: Open `config.toml` and add `current_year = "2026"` under `[extra]`, near `cfp_year`. The relevant section should look like:**

```toml
[extra]
og_preview_img = "/img/nix-vegas-thumb.png"
twitter_site = "@nixvegas"
twitter_user = "@nixvegas"
masto_user = "@nixvegas@defcon.social"
timezone = "America/Los_Angeles"
current_year = "2026"
cfp_year = "2026"
```

- [ ] **Step 2: Build to confirm parse.**

```bash
nix build .#default
```

- [ ] **Step 3: Don't commit yet — bundled with the rest of Phase 2.**

---

### Task 2.3: Create `templates/components/past_events_list.html`

**Files:**
- Create: `templates/components/past_events_list.html`

- [ ] **Step 1: Create the file with this content:**

```html
{% set current_year = config.extra.current_year %}
{# Collect all top-level year sections by globbing _index.md files in content/YYYY/ #}
{% set sections = get_section(path="_index.md").subsections %}
<ul class="past-events-list">
  {% for section_path in sections %}
    {% set sec = get_section(path=section_path) %}
    {# Only include year sections — path looks like "YYYY/_index.md" #}
    {% if sec.path is matching("^/[0-9]{4}/$") %}
      {% set year = sec.path | trim_start_matches(pat="/") | trim_end_matches(pat="/") %}
      {% if year != current_year %}
        <li>
          <a href="/{{ year }}/">
            <span class="past-event-year">{{ year }}</span>
            <span class="past-event-defcon">{{ sec.extra.event_defcon }}</span>
            {% if sec.extra.event_tagline %}
              <span class="past-event-tagline">"{{ sec.extra.event_tagline }}"</span>
            {% endif %}
          </a>
        </li>
      {% endif %}
    {% endif %}
  {% endfor %}
</ul>
```

Note: Zola's `get_section(path=...).subsections` returns a list of section paths (strings like `"2025/_index.md"`). Some Zola versions return paths starting with `/`; some don't. The `trim_start_matches` handles both. If at build time this template emits an error about a missing section or wrong filter, adjust based on the actual Zola 0.21.0 behavior (run `nix develop -c zola check` for diagnostics).

---

### Task 2.4: Create `templates/components/recent_posts.html`

**Files:**
- Create: `templates/components/recent_posts.html`

- [ ] **Step 1: Create the file with this content:**

```html
{% set blog = get_section(path="blog/_index.md") %}
{% set recent = blog.pages | slice(end=3) %}
<ul class="recent-posts-list">
  {% for post in recent %}
    <li>
      <p class="recent-post-date">{{ post.date }}</p>
      <h3 class="recent-post-title"><a href="{{ post.permalink }}">{{ post.title }}</a></h3>
      <p class="recent-post-description">{{ post.description }}</p>
    </li>
  {% endfor %}
</ul>
```

Note: In Phase 3 the blog gets reorganized under year subsections. Zola's `section.pages` only includes direct children, so after Phase 3 this component will return zero posts. Phase 3 includes an update to use `section.pages_with_subsections` or equivalent. For now (after Phase 2 but before Phase 3), this works.

---

### Task 2.5: Create `sass/components/root.scss`

**Files:**
- Create: `sass/components/root.scss`

- [ ] **Step 1: Create the file with this content:**

```scss
.current-event-callout {
  display: block;
  padding: 2rem;
  border: 2px solid currentColor;
  text-decoration: none;
  color: inherit;
  margin: 2rem 0;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .current-event-callout-defcon {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .current-event-callout-dates {
    font-size: 1.25rem;
  }

  .current-event-callout-location {
    font-size: 1rem;
    opacity: 0.85;
  }

  .current-event-callout-tagline {
    font-style: italic;
    margin-top: 0.5rem;
  }

  .current-event-callout-cta {
    margin-top: 1rem;
    font-weight: bold;
  }
}

.past-events-list,
.recent-posts-list {
  list-style: none;
  padding: 0;

  li {
    margin: 1rem 0;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  a {
    text-decoration: none;
    color: inherit;

    &:hover {
      text-decoration: underline;
    }
  }
}

.past-events-list {
  .past-event-year {
    font-weight: bold;
    margin-right: 0.5em;
  }

  .past-event-defcon {
    margin-right: 0.5em;
  }

  .past-event-tagline {
    font-style: italic;
    opacity: 0.85;
  }
}

.recent-posts-list {
  .recent-post-date {
    font-size: 0.875rem;
    opacity: 0.7;
    margin-bottom: 0.25rem;
  }

  .recent-post-title {
    margin: 0.25rem 0;
  }
}
```

These styles match the existing visual language (subtle borders, currentColor inheritance, italic taglines). The team can refine later — the structure and class names are the contract.

---

### Task 2.6: Wire `root.scss` into `sass/style.scss`

**Files:**
- Modify: `sass/style.scss`

- [ ] **Step 1: Read the current file.**

```bash
cat sass/style.scss
```

- [ ] **Step 2: Add `@import './components/root.scss';` at the end. The full file after edit should read:**

```scss
.main-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
}

.container {
  max-width: 100%;
}

@import './reset.scss';
@import './typography.scss';
@import './glitch.scss';
@import './components/hero.scss';
@import './components/schedule.scss';
@import './components/speakers.scss';
@import './components/navigation.scss';
@import './components/sponsors.scss';
@import './components/social-bar.scss';
@import './components/blog.scss';
@import './components/footer.scss';
@import './components/root.scss';
```

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

Expected: SCSS compiles cleanly. Inspect `result/public/style.css` and confirm `.current-event-callout` rules appear.

```bash
grep -c "current-event-callout" result/public/style.css
```

Expected: a positive integer.

---

### Task 2.7: Create `templates/root.html`

**Files:**
- Create: `templates/root.html`

- [ ] **Step 1: Create the file with this content:**

```html
{% extends 'base.html' %}

{% block content %}
  <div class="root-landing">
    {% include 'components/current_event_callout.html' %}

    <section class="root-about">
      {{ section.content | safe }}
    </section>

    <section class="root-recent-posts">
      <h2>Recent posts</h2>
      {% include 'components/recent_posts.html' %}
      <p><a href="/blog">All posts →</a></p>
    </section>

    <section class="root-past-events">
      <h2>Past events</h2>
      {% include 'components/past_events_list.html' %}
    </section>
  </div>
{% endblock %}
```

The page's about-the-community markdown is rendered from `content/_index.md`'s body via `{{ section.content | safe }}`. The other sections come from the components.

Note: `templates/base.html` currently does `{% set year_section = get_section(path=year_dir ~ "/_index.md") %}` for hero rendering. When `year_dir` is empty (the root), it falls back to `get_section(path="_index.md")` — meaning the root's hero image/favicon comes from `content/_index.md`'s own frontmatter. That's the right behavior. The root's frontmatter needs `extra.favicon_*` and `extra.hero_img` (handled in Task 2.8).

---

### Task 2.8: Create `content/_index.md` (evergreen root)

**Files:**
- Create: `content/_index.md`

- [ ] **Step 1: Create the file with this content:**

```markdown
---
template: "root.html"
title: "Nix Vegas"

extra:
  favicon_ico: "/img/favicon.ico"
  favicon_16: "/img/favicon-16x16.png"
  favicon_32: "/img/favicon-32x32.png"
  favicon_48: "/img/favicon-48x48.png"
  favicon_512: "/img/favicon.png"
  hero_img: "/img/2025/nix-vegas.png"
  hero_glitch_imgs: []
---

## About Nix Vegas

Nix Vegas is a [DEF CON](https://defcon.org) community of [Nix](https://nixos.org) users and developers, hosted by the [SoCal NixOS User Group](https://socal-nug.com) and Distractions, Inc. Whether you use Nix to break insecure hardware, build reproducible supply chains, or replace SaaS with self-hosted services, come learn about the quiet revolution that's reshaping software.

Newbies and users of any distro are welcome.

## Contact

All emails route to a shared inbox managed by the team.

- General: <noc@nix.vegas>
- CFP questions: <cfp@nix.vegas>
- Sponsorships: <sponsor@nix.vegas>
```

The `hero_img` is reused from 2025's art for now — the spec's open items note this is a TODO for a project-neutral asset.

- [ ] **Step 2: Create `content/hero.md` for the root.** The existing `templates/components/hero.html` calls `get_page(path="hero.md")` when no year is detected. Create:

```bash
cat content/2026/hero.md
```

Expected: the 2026 hero markdown (with the DEF CON 34 dates etc.).

Now create `content/hero.md` with simpler evergreen content:

```html
---
title: "Hero"
---
<figure class="brand">
    <h1 class="hero-title"><span><a href="/">Nix Vegas</a></span></h1>
    <h2 class="hero-title"><span>A DEF CON community of Nix users and developers</span></h2>
</figure>
```

No dates, no DEF CON year — those are on the year hero. The root hero is timeless.

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

If the build fails because `subsections` filter logic in `past_events_list.html` doesn't match Zola 0.21.0's actual return type, adjust. Most likely the path matching needs tweaking. Use `zola check` for diagnostics:

```bash
nix develop -c zola check
```

- [ ] **Step 4: Serve and verify in browser.**

```bash
nix develop -c zola serve
```

Open `http://127.0.0.1:1111/`. Expected: new evergreen page with hero ("A DEF CON community of Nix users and developers"), current-event callout (DEF CON 34, August 6–9 2026, Las Vegas), about section, recent posts (3 most recent), past events list (containing 2025 only).

Open `http://127.0.0.1:1111/2026/` — still renders the 2026 event content (uses `home.html` template).

Open `http://127.0.0.1:1111/2025/` — still renders the 2025 archive (uses `home.html` template).

Stop the server.

- [ ] **Step 5: Commit the full Phase 2 batch.**

```bash
git add config.toml content/_index.md content/hero.md templates/root.html templates/components/current_event_callout.html templates/components/past_events_list.html templates/components/recent_posts.html sass/components/root.scss sass/style.scss
git commit -m "feat: add evergreen root landing page"
```

Phase 2 complete.

---

## Phase 3: Reorganize blog by year

**Goal of phase:** Posts move from flat `/blog/<slug>` to `/blog/YYYY/<slug>`. 301 redirects activate. The blog index template groups posts by year. The `/#sponsors` link in `dc32-nixmesh` is rewritten. The `DEF CON 26` typo in 2026 is fixed.

### Task 3.1: Move blog posts into year subfolders

**Files:**
- Move: `content/blog/2025-retrospective.md` → `content/blog/2025/2025-retrospective.md`
- Move: `content/blog/artwork.md` → `content/blog/2025/artwork.md`
- Move: `content/blog/sneak-preview.md` → `content/blog/2025/sneak-preview.md`
- Move: `content/blog/dc32-nixmesh.md` → `content/blog/2025/dc32-nixmesh.md`
- Create: `content/blog/2025/_index.md`

- [ ] **Step 1: Create the year subfolder.**

```bash
mkdir -p content/blog/2025
```

- [ ] **Step 2: Move each post with `git mv`.**

```bash
git mv content/blog/2025-retrospective.md content/blog/2025/2025-retrospective.md
git mv content/blog/artwork.md content/blog/2025/artwork.md
git mv content/blog/sneak-preview.md content/blog/2025/sneak-preview.md
git mv content/blog/dc32-nixmesh.md content/blog/2025/dc32-nixmesh.md
```

- [ ] **Step 3: Create `content/blog/2025/_index.md` so Zola recognizes the year as a subsection:**

```markdown
---
title: "2025 posts"
sort_by: "date"
transparent: true
---
```

The `transparent: true` flag is critical — it makes the parent `/blog` section's `pages` listing include posts from subsections recursively. Without it, the blog index wouldn't see the moved posts.

- [ ] **Step 4: Verify the structure.**

```bash
ls content/blog content/blog/2025
```

Expected:
```
content/blog:
_index.md
2025/

content/blog/2025:
_index.md
2025-retrospective.md
artwork.md
dc32-nixmesh.md
sneak-preview.md
```

- [ ] **Step 5: Build.**

```bash
nix build .#default
```

Inspect output paths:

```bash
ls result/public/blog/2025/
```

Expected: `2025-retrospective/`, `artwork/`, `dc32-nixmesh/`, `sneak-preview/` directories, each containing an `index.html`.

- [ ] **Step 6: Visit one in the browser.**

```bash
nix develop -c zola serve
# Open http://127.0.0.1:1111/blog/2025/2025-retrospective in a browser
```

Confirm the post renders with its content.

- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "blog: move posts into year subfolders"
```

---

### Task 3.2: Activate blog redirects

**Files:**
- Modify: `static/_redirects`

- [ ] **Step 1: Uncomment the four blog redirects in `static/_redirects`. After edit, the bottom of the file should read:**

```
# Permanent blog redirects (one-time moves from flat /blog/<slug> to /blog/YYYY/<slug>)
/blog/2025-retrospective   /blog/2025/2025-retrospective   301
/blog/artwork              /blog/2025/artwork              301
/blog/sneak-preview        /blog/2025/sneak-preview        301
/blog/dc32-nixmesh         /blog/2025/dc32-nixmesh         301
```

- [ ] **Step 2: Build and confirm redirects file ships.**

```bash
nix build .#default
cat result/public/_redirects
```

Expected: redirects file contains both current-year and permanent blog sections, no leading `#` on the blog lines.

- [ ] **Step 3: Commit.**

```bash
git add static/_redirects
git commit -m "static: activate permanent blog redirects"
```

---

### Task 3.3: Update `templates/blog.html` to group posts by year

The current template iterates `section.pages` flat. Now that posts live in subsections, group by year and sort years descending.

**Files:**
- Modify: `templates/blog.html`

- [ ] **Step 1: Read the current template.**

```bash
cat templates/blog.html
```

- [ ] **Step 2: Replace with this content:**

```html
{% import "macros/date.html" as date_macros %}
{% extends "base.html" %}

{% block content %}
<div class="blog-wrapper">
  <div class="container">
    {% set blog = get_section(path="blog/_index.md") %}
    {# Group posts by year by iterating subsections (each subsection = one year) #}
    {# Sort subsections by path descending so newer years appear first #}
    {% set year_section_paths = blog.subsections | sort | reverse %}
    {% for year_path in year_section_paths %}
      {% set year_section = get_section(path=year_path) %}
      {# Extract year from the section's path (e.g. /blog/2025/ -> 2025) #}
      {% set year = year_section.path | trim_start_matches(pat="/blog/") | trim_end_matches(pat="/") %}
      <h2 class="blog-year-heading">{{ year }}</h2>
      <ul class="blog-post-list">
        {% for post in year_section.pages %}
        <li class="blog-post">
          <p class="blog-post-date">
            {{ post.date }}
          </p>
          <h3 class="title is-h3">
            <a href="{{ post.permalink }}">
              {{ post.title }}
            </a>
          </h3>
          <h4 class="subtitle is-h4">
            {{ post.description }}
          </h4>
          <h5 class="author is-h5">
            {{ post.authors | join(sep=" and ") }}
          </h5>
        </li>
        {% endfor %}
      </ul>
    {% endfor %}
  </div>
</div>
{% endblock content %}
```

Note: heading levels demoted (h2→h3, etc.) to leave h2 for the year headings. If the existing typography depends on the old heading levels, this may look slightly different. Verify visually.

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

If the build complains about `trim_start_matches` not being a valid filter on the path type, replace with `replace`:

```
{% set year = year_section.path | replace(from="/blog/", to="") | replace(from="/", to="") %}
```

- [ ] **Step 4: Verify in browser.**

```bash
nix develop -c zola serve
# Open http://127.0.0.1:1111/blog
```

Expected: "2025" heading, then four post entries underneath. Stop the server.

- [ ] **Step 5: Commit.**

```bash
git add templates/blog.html
git commit -m "blog: group posts by year in index template"
```

---

### Task 3.4: Update recent-posts component to read across subsections

The component created in Task 2.4 reads `section.pages` directly, which only returns direct children of `/blog`. Since posts now live in subsections, the recent-posts list on the root is empty. Fix it.

**Files:**
- Modify: `templates/components/recent_posts.html`

- [ ] **Step 1: Replace the file content with:**

```html
{# Collect posts from all year subsections of /blog and pick the 3 most recent #}
{% set blog = get_section(path="blog/_index.md") %}
{% set all_posts = [] %}
{% for year_path in blog.subsections %}
  {% set year_section = get_section(path=year_path) %}
  {% set all_posts = all_posts | concat(with=year_section.pages) %}
{% endfor %}
{% set sorted_posts = all_posts | sort(attribute="date") | reverse %}
{% set recent = sorted_posts | slice(end=3) %}
<ul class="recent-posts-list">
  {% for post in recent %}
    <li>
      <p class="recent-post-date">{{ post.date }}</p>
      <h3 class="recent-post-title"><a href="{{ post.permalink }}">{{ post.title }}</a></h3>
      <p class="recent-post-description">{{ post.description }}</p>
    </li>
  {% endfor %}
</ul>
```

Note: this iterates all year subsections and concatenates their pages, then sorts by date. With `transparent: true` set on the year subsections (Task 3.1), `blog.pages` *might* also work directly — try the simpler version first if the complex one fails to compile:

```html
{% set blog = get_section(path="blog/_index.md") %}
{% set recent = blog.pages | sort(attribute="date") | reverse | slice(end=3) %}
<ul class="recent-posts-list">
  ...
```

- [ ] **Step 2: Build.**

```bash
nix build .#default
```

- [ ] **Step 3: Verify in browser.**

```bash
nix develop -c zola serve
# Open http://127.0.0.1:1111/
```

Expected: "Recent posts" section now shows 3 most recent posts (likely 2025-retrospective, artwork, sneak-preview based on dates).

- [ ] **Step 4: Commit.**

```bash
git add templates/components/recent_posts.html
git commit -m "blog: aggregate posts across year subsections for recent-posts list"
```

---

### Task 3.5: Fix `/#sponsors` link in `dc32-nixmesh`

**Files:**
- Modify: `content/blog/2025/dc32-nixmesh.md`

- [ ] **Step 1: Find any reference to `/#sponsors` in the post.**

```bash
grep -n "#sponsors" content/blog/2025/dc32-nixmesh.md
```

If no match: skip to step 4. (The original observation may have been about a different file. Verify.)

- [ ] **Step 2: If matched, edit each occurrence to `/2025/#sponsors`.**

Use the Edit tool to replace `/#sponsors` with `/2025/#sponsors`.

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

- [ ] **Step 4: Also grep all other blog posts for `/#sponsors` in case the link was elsewhere.**

```bash
grep -rn "#sponsors" content/blog/
```

If any matches in posts published in 2025 or earlier, replace with `/2025/#sponsors`.

- [ ] **Step 5: Commit.**

```bash
git add -A
git commit -m "blog: fix /#sponsors anchor links to point at /2025/#sponsors"
```

---

### Task 3.6: Fix `DEF CON 26` typo in 2026 home

**Files:**
- Modify: `content/2026/_index.md`

- [ ] **Step 1: Read the current content body.**

```bash
sed -n '15,25p' content/2026/_index.md
```

Expected: a line like `## DEF CON 26 Theme: Agency`.

- [ ] **Step 2: Edit `DEF CON 26` → `DEF CON 34` (matching the hero).**

Use the Edit tool. Old: `## DEF CON 26 Theme: Agency`. New: `## DEF CON 34 Theme: Agency`.

Also check the link in the same paragraph: `https://defcon.org/html/defcon-34/dc-34-theme.html` — verify it's pointing at defcon-34, not defcon-26. If it's pointing at defcon-26, fix it.

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

- [ ] **Step 4: Verify in browser.**

```bash
nix develop -c zola serve
# Open http://127.0.0.1:1111/2026/
```

Expected: heading reads "DEF CON 34 Theme: Agency".

- [ ] **Step 5: Commit.**

```bash
git add content/2026/_index.md
git commit -m "content: fix DEF CON 26 typo (should be 34)"
```

Phase 3 complete.

---

## Phase 4: Template refactor (no behavior change)

**Goal of phase:** Kill the `current_path` regex in `base.html`. Use `config.extra.current_year` and `page.ancestors` instead. Rename `home.html` → `year_home.html`. Collapse `blog_templates/`. Year-scope the navigation. Move data files to `data/YYYY/` and make templates year-aware.

This phase changes a lot of files but **must produce identical rendered HTML** to before. Verify with a diff at the end.

### Task 4.1: Snapshot pre-refactor rendered HTML

To diff against after refactor.

- [ ] **Step 1: Build and copy output to a snapshot.**

```bash
nix build .#default
cp -r result/public /tmp/nv-pre-refactor
ls /tmp/nv-pre-refactor
```

Expected: full site structure copied.

- [ ] **Step 2: Note this is a throwaway snapshot. No commit.**

---

### Task 4.2: Create `templates/macros/year.html`

**Files:**
- Create: `templates/macros/year.html`

- [ ] **Step 1: Create the file with this content:**

```html
{# Returns the year a page belongs to by parsing its path. #}
{# For pages under /YYYY/, returns "YYYY". For pages not under a year (root, /blog), returns the empty string. #}
{% macro year_of_page(page) %}
{%- set parts = page.path | split(pat="/") -%}
{%- if parts | length > 1 and parts[1] is matching("^[0-9]{4}$") -%}
{{- parts[1] -}}
{%- endif -%}
{% endmacro year_of_page %}

{# Same, but for a section path. #}
{% macro year_of_section(section) %}
{%- set parts = section.path | split(pat="/") -%}
{%- if parts | length > 1 and parts[1] is matching("^[0-9]{4}$") -%}
{{- parts[1] -}}
{%- endif -%}
{% endmacro year_of_section %}

{# Returns the year context for the currently-rendering template. #}
{# Falls back to the current event year from config when no year context is detectable. #}
{% macro current_year() %}
{{- config.extra.current_year -}}
{% endmacro current_year %}
```

The `matching` test on `"^[0-9]{4}$"` is Zola/Tera's regex test. Verify it's supported in Zola 0.21.0 — alternatively use a numeric range check.

- [ ] **Step 2: Build to confirm macros parse (they're not used yet but Tera validates them at import time).**

```bash
nix build .#default
```

---

### Task 4.3: Refactor `templates/base.html` to drop the `current_path` regex

Replace the regex-based year detection with `page.ancestors` / `section.ancestors` and `config.extra.current_year`.

**Files:**
- Modify: `templates/base.html`

- [ ] **Step 1: Read the current file.**

```bash
cat templates/base.html
```

- [ ] **Step 2: Replace with this content:**

```html
{% import "macros/social.html" as social -%}
{% import "macros/year.html" as year_macros -%}
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>
      {%- block title -%}
        {{ social::og_title() }}
      {%- endblock -%}
    </title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="title" content="{{ config.title }}">
    <meta name="description" content="{{ config.description }}">
    <meta name="author" content="{{ config.title }} Organizers">
    <meta name="fediverse:creator" content="{{ config.extra.masto_user }}">
    <meta property="og:locale" content="en_US:utf-8">
    <meta property="og:site_name" content="{{ config.title }}">
    {%- block og_preview -%}
      {{ social::og_preview() }}
    {%- endblock og_preview -%}

    {%- block twitter_preview -%}
      {{ social::twitter_preview() }}
    {%- endblock twitter_preview -%}

    <link rel="stylesheet" href="/style.css">

    {# Determine which year section to read frontmatter from. #}
    {# If rendering a page or section under /YYYY/, use that year's section. Otherwise, root section. #}
    {% set year_dir = "" %}
    {% if page %}
      {% set year_dir = year_macros::year_of_page(page=page) %}
    {% elif section %}
      {% set year_dir = year_macros::year_of_section(section=section) %}
    {% endif %}

    {% if year_dir %}
      {% set_global year_section = get_section(path=year_dir ~ "/_index.md") %}
      {% set_global year_prefix = "/" ~ year_dir %}
    {% else %}
      {% set_global year_section = get_section(path="_index.md") %}
      {% set_global year_prefix = "" %}
    {% endif %}

    {# Hero/favicon images come from year_section.extra. #}
    <link rel="icon" type="image/x-icon" href="{{ year_section.extra.favicon_ico }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ year_section.extra.favicon_16 }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ year_section.extra.favicon_32 }}">
    <link rel="icon" type="image/png" sizes="48x48" href="{{ year_section.extra.favicon_48 }}">
    <link rel="icon" type="image/png" sizes="512x512" href="{{ year_section.extra.favicon_512 }}">
    <link rel="preload" as="image" href="{{ year_section.extra.hero_img }}">
    {% for img in year_section.extra.hero_glitch_imgs %}
    <link rel="preload" as="image" href="{{ img }}">
    {% endfor %}
  </head>
  <body>
    {% include 'components/hero.html' %}
    {% include 'components/navigation.html' %}
    {% block before_content %}
    {% endblock %}
    <div class="content">
        {% block content %}
        {% endblock %}
    </div>
    {% include 'components/footer.html' %}
  </body>
</html>
```

Key change: `year_dir` is now derived from `page.path` or `section.path` via the `year_of_*` macros, not from a regex on `current_path`. The `year_prefix` and `year_section` globals are set the same way (used by `home.html`/`year_home.html` and `navigation.html`).

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

Expected: builds cleanly. If errors mention `page` or `section` being undefined in some context (Zola has multiple template invocation contexts: page, section, taxonomy, etc.), wrap accesses with `{% if page %}` / `{% elif section %}` guards as already shown.

---

### Task 4.4: Snapshot post-base-refactor and diff

- [ ] **Step 1: Build and copy.**

```bash
nix build .#default
cp -r result/public /tmp/nv-post-base
```

- [ ] **Step 2: Diff.**

```bash
diff -r /tmp/nv-pre-refactor /tmp/nv-post-base | head -100
```

Expected: no differences, OR only whitespace differences. Any meaningful HTML difference is a regression — investigate and fix.

If clean: proceed. If not: revert and re-do.

- [ ] **Step 3: Commit base.html refactor.**

```bash
git add templates/base.html templates/macros/year.html
git commit -m "templates: replace current_path regex with page/section path + config.extra.current_year"
```

---

### Task 4.5: Rename `home.html` → `year_home.html`

**Files:**
- Move: `templates/home.html` → `templates/year_home.html`
- Modify: `content/2025/_index.md` (frontmatter template field)
- Modify: `content/2026/_index.md` (frontmatter template field)

- [ ] **Step 1: Move the template.**

```bash
git mv templates/home.html templates/year_home.html
```

- [ ] **Step 2: Update frontmatter in 2025 and 2026 `_index.md`. Change `template: "home.html"` to `template: "year_home.html"` in both files.**

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

Expected: builds.

- [ ] **Step 4: Diff against snapshot.**

```bash
cp -r result/public /tmp/nv-post-rename-home
diff -r /tmp/nv-post-base /tmp/nv-post-rename-home | head -50
```

Expected: no differences.

- [ ] **Step 5: Commit.**

```bash
git add templates/year_home.html content/2025/_index.md content/2026/_index.md
git commit -m "templates: rename home.html -> year_home.html"
```

---

### Task 4.6: Collapse `blog_templates/base.html` → `blog_post.html`

**Files:**
- Move: `templates/blog_templates/base.html` → `templates/blog_post.html`
- Modify: each blog post's `template:` frontmatter field

- [ ] **Step 1: Move the template.**

```bash
git mv templates/blog_templates/base.html templates/blog_post.html
rmdir templates/blog_templates
```

- [ ] **Step 2: Update each blog post's `template:` frontmatter from `blog_templates/base.html` → `blog_post.html`.**

```bash
grep -l 'blog_templates/base.html' content/blog/2025/*.md
```

Expected: lists all four 2025 posts. Edit each to change the template field.

For each file, use the Edit tool:
- old: `template: "blog_templates/base.html"`
- new: `template: "blog_post.html"`

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

- [ ] **Step 4: Diff against snapshot.**

```bash
cp -r result/public /tmp/nv-post-blog-rename
diff -r /tmp/nv-post-rename-home /tmp/nv-post-blog-rename | head -50
```

Expected: no differences.

- [ ] **Step 5: Commit.**

```bash
git add -A
git commit -m "templates: collapse blog_templates/base.html into blog_post.html"
```

---

### Task 4.7: Rename `social-bar.html` and `social-bar.scss` to `social_bar.*`

For consistency with snake_case used elsewhere. Update all includes/imports.

**Files:**
- Move: `templates/components/social-bar.html` → `templates/components/social_bar.html`
- Move: `sass/components/social-bar.scss` → `sass/components/social_bar.scss`
- Modify: every template that includes `social-bar.html`
- Modify: `sass/style.scss`

- [ ] **Step 1: Find all includes of `social-bar.html`.**

```bash
grep -rn "social-bar.html" templates/
```

Expected: at least `templates/components/hero.html` and `templates/components/footer.html`.

- [ ] **Step 2: Rename the files.**

```bash
git mv templates/components/social-bar.html templates/components/social_bar.html
git mv sass/components/social-bar.scss sass/components/social_bar.scss
```

- [ ] **Step 3: Update each include reference using sed-equivalent or Edit tool. Each `{% include 'components/social-bar.html' %}` becomes `{% include 'components/social_bar.html' %}`.**

Use the Edit tool on each file from Step 1.

- [ ] **Step 4: Update the SCSS import in `sass/style.scss`. Change `@import './components/social-bar.scss';` → `@import './components/social_bar.scss';`.**

- [ ] **Step 5: Build.**

```bash
nix build .#default
```

- [ ] **Step 6: Diff.**

```bash
cp -r result/public /tmp/nv-post-snake
diff -r /tmp/nv-post-blog-rename /tmp/nv-post-snake | head -50
```

Expected: no differences.

- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "templates: rename social-bar -> social_bar for snake_case consistency"
```

---

### Task 4.8: Move `data/*.json` → `data/2025/*.json`

The two data files (`schedule.json`, `speakers-filtered.json`) currently contain 2025 data. Relocate.

**Files:**
- Move: `data/schedule.json` → `data/2025/schedule.json`
- Move: `data/speakers-filtered.json` → `data/2025/speakers-filtered.json`

- [ ] **Step 1: Confirm what's in `data/`.**

```bash
ls data/
```

- [ ] **Step 2: Create subdir and move.**

```bash
mkdir -p data/2025
git mv data/schedule.json data/2025/schedule.json
git mv data/speakers-filtered.json data/2025/speakers-filtered.json
```

If files weren't tracked in git, use `mv` and then `git add data/2025/`.

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

Expected: build *fails* because `templates/schedule.html` and `templates/speakers.html` still reference `data/schedule.json` and `data/speakers-filtered.json` (no year prefix). That's expected and gets fixed in Task 4.9. Don't commit yet — bundle with Task 4.9.

---

### Task 4.9: Make `schedule.html` and `speakers.html` year-aware

**Files:**
- Modify: `templates/schedule.html`
- Modify: `templates/speakers.html`

- [ ] **Step 1: Read `templates/schedule.html`.**

```bash
cat templates/schedule.html
```

- [ ] **Step 2: Edit to use year-aware data path. Replace the `load_data` line:**

Old:
```
{% set schedule = load_data(path="data/schedule.json", format="json") %}
```

New:
```
{% import "macros/year.html" as year_macros %}
{% set year = year_macros::year_of_page(page=page) | trim %}
{% set schedule = load_data(path="data/" ~ year ~ "/schedule.json", format="json") %}
```

Insert the `{% import ... %}` near the top of the template (before the `{% block content %}` line if you can, otherwise inside the block).

- [ ] **Step 3: Do the same for `templates/speakers.html`. The old line:**

```
{% set speakers = load_data(path="data/speakers-filtered.json", format="json") %}
```

becomes:

```
{% import "macros/year.html" as year_macros %}
{% set year = year_macros::year_of_page(page=page) | trim %}
{% set speakers = load_data(path="data/" ~ year ~ "/speakers-filtered.json", format="json") %}
```

- [ ] **Step 4: Build.**

```bash
nix build .#default
```

Expected: builds. The 2025 schedule and speakers pages now load from `data/2025/...`.

- [ ] **Step 5: Verify in browser.**

```bash
nix develop -c zola serve
# Open http://127.0.0.1:1111/2025/schedule and http://127.0.0.1:1111/2025/speakers
```

Confirm the schedule and speakers list render with content.

Stop the server.

- [ ] **Step 6: Diff against snapshot.**

```bash
cp -r result/public /tmp/nv-post-data-year
diff -r /tmp/nv-post-snake /tmp/nv-post-data-year | head -50
```

Expected: no differences (the underlying JSON is the same data, just at a different path).

- [ ] **Step 7: Commit Tasks 4.8 + 4.9 together.**

```bash
git add -A
git commit -m "data: year-scope schedule/speakers data under data/YYYY/"
```

---

### Task 4.10: Update `script/refresh-data.sh` to write into `data/YYYY/`

**Files:**
- Modify: `script/refresh-data.sh`

- [ ] **Step 1: Read current script.**

```bash
cat script/refresh-data.sh
```

- [ ] **Step 2: Modify to accept a year argument and write to `data/$YEAR/`.**

```bash
#!/usr/bin/env nix-shell
#!nix-shell -i bash -p curl jq

if [ $# -ne 2 ]; then
    echo "Usage: $0 <year> <sessionize-all-url>" >&2
    echo "Example: $0 2026 https://sessionize.com/api/v2/abc123/view/All" >&2
    exit 1
fi

YEAR=$1
URL=$2

mkdir -p "data/$YEAR"
curl "${URL//All/Speakers}" | jq > "data/$YEAR/speakers-filtered.json"
curl "${URL//All/GridSmart}" | jq > "data/$YEAR/schedule.json"
```

- [ ] **Step 3: Make executable (if not already).**

```bash
chmod +x script/refresh-data.sh
```

- [ ] **Step 4: Commit.**

```bash
git add script/refresh-data.sh
git commit -m "script: refresh-data writes to data/YYYY/ keyed by year arg"
```

---

### Task 4.11: Year-scope navigation

The current `templates/components/navigation.html` has nested conditions for `config.extra.onsite`, archive vs. current year, etc. Refactor to use the `year_dir` global set by `base.html` and add a "Current event →" link when viewing a non-current year.

**Files:**
- Modify: `templates/components/navigation.html`

- [ ] **Step 1: Read current navigation.**

```bash
cat templates/components/navigation.html
```

- [ ] **Step 2: Replace with this content. (Note: `config.extra.onsite` branch is preserved here pending Phase 5 deletion. Pure refactor.)**

```html
{% set current_year = config.extra.current_year %}
{# year_prefix and year_dir are set by base.html. #}
{# year_dir is "" for root/blog pages, "YYYY" otherwise. #}
{% set viewing_current_year = (year_dir == current_year) or (year_dir == "") %}

<header>
  <nav class="nav-header container">
    <ul>
      {% if config.extra.onsite %}
        {# Onsite kiosk mode — preserved for backwards compatibility until Phase 5 #}
        <li><a href="{{ year_prefix }}/">Welcome</a></li>
        <li><a href="{{ year_prefix }}/#sponsors">Sponsors</a></li>
        <li><a href="{{ year_prefix }}/schedule">Schedule</a></li>
        <li><a href="{{ year_prefix }}/speakers">Speakers</a></li>
      {% else %}
        <li><a href="/">Home</a></li>
        {% if year_dir %}
          {# Inside a year — links scope to that year #}
          <li><a href="/{{ year_dir }}/">{{ year_dir }} event</a></li>
          <li><a href="/{{ year_dir }}/#sponsors">Sponsors</a></li>
          <li><a href="/{{ year_dir }}/about">About</a></li>
          <li><a href="/{{ year_dir }}/schedule">Schedule</a></li>
          <li><a href="/{{ year_dir }}/speakers">Speakers</a></li>
          {% if not viewing_current_year %}
            <li><a href="/{{ current_year }}/">Current event →</a></li>
          {% endif %}
        {% else %}
          {# Root or blog — links scope to current year #}
          <li><a href="/{{ current_year }}/">Current event</a></li>
          <li><a href="/{{ current_year }}/about">About</a></li>
          <li><a href="https://cfp.nix.vegas/{{ config.extra.cfp_year }}">CFP</a></li>
        {% endif %}
        <li><a href="/blog">Blog</a></li>
      {% endif %}
    </ul>
  </nav>
</header>
```

Differences from the original:
- The old "Archive (/2025)" hardcoded link is replaced by the past-events list on the root.
- The old `year_prefix` shorthand still works for the onsite branch.
- Year-scoped pages get a "Current event →" pointer when viewing an archived year.

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

- [ ] **Step 4: Verify in browser, navigating between `/`, `/2026/about`, `/2025/about`, `/blog`. Confirm nav adapts year-scope correctly.**

```bash
nix develop -c zola serve
```

Expected: on `/2025/about`, nav shows "2025 event", "2025 schedule", etc., AND a "Current event →" link to `/2026/`. On `/2026/about`, nav shows 2026 links without the "Current event →" (because it IS the current event).

- [ ] **Step 5: Diff.**

This task DOES change rendered HTML (the nav is different) — the diff will show many differences. That's expected. Visual verification is the gate, not diff cleanness.

- [ ] **Step 6: Commit.**

```bash
git add templates/components/navigation.html
git commit -m "templates: year-scope navigation by page context; add 'Current event →' link"
```

---

### Task 4.12: Final Phase 4 verification

- [ ] **Step 1: Build clean.**

```bash
nix build .#default
```

- [ ] **Step 2: Smoke test in browser.**

```bash
nix develop -c zola serve
```

Visit and verify:
- `/` — root landing with hero, current-event callout, about, recent posts, past events
- `/2026/` — 2026 home with hero and CFP content
- `/2026/about` — about page with current event date/location
- `/2025/` — 2025 home with glitched hero, "Rebuild the World"
- `/2025/about` — 2025 about with August 7–10, 2025
- `/2025/schedule` — schedule renders from `data/2025/schedule.json`
- `/2025/speakers` — speakers render from `data/2025/speakers-filtered.json`
- `/blog` — grouped by year heading
- `/blog/2025/2025-retrospective` — post renders
- `/blog/2025/dc32-nixmesh` — post renders, `#sponsors` link points at `/2025/#sponsors`

- [ ] **Step 3: Stop server.**

Phase 4 complete.

---

## Phase 5: Drop onsite build flag; rename `offsite.md` → `intro.md`

**Goal of phase:** No more `config.extra.onsite` branching. `content/YYYY/onsite.md` is a regular standalone page at `/YYYY/onsite`. `offsite.md` files renamed to `intro.md`. `nixVegasOnsite` flake output and `onsite.nix` derivation deleted.

### Task 5.1: Rename `offsite.md` → `intro.md`

**Files:**
- Move: `content/2025/offsite.md` → `content/2025/intro.md`
- Move: `content/2026/offsite.md` → `content/2026/intro.md`

- [ ] **Step 1: Move with `git mv`.**

```bash
git mv content/2025/offsite.md content/2025/intro.md
git mv content/2026/offsite.md content/2026/intro.md
```

- [ ] **Step 2: Don't build yet — `year_home.html` still references `offsite.md`. Fix in next task.**

---

### Task 5.2: Update `year_home.html` to render `intro.md` unconditionally

**Files:**
- Modify: `templates/year_home.html`

- [ ] **Step 1: Read current template.**

```bash
cat templates/year_home.html
```

- [ ] **Step 2: Replace with this content (no more onsite/offsite branching, no more `config.extra.onsite`):**

```html
{% extends 'base.html' %}

{% block content %}
  {% set year = year_dir %}
  {% set intro_path = year ~ "/intro.md" %}
  {% set intro = get_page(path=intro_path, required=false) %}
  {% if intro %}
    {{ intro.content | safe }}
  {% endif %}
  {{ section.content | safe }}
{% endblock %}
```

Key change: no `config.extra.onsite` conditional. Always render `intro.md` (if present) above section content.

Note: Zola's `get_page` may not support `required=false`. If it errors, use a different mechanism:

```html
{# Alternative: use section.pages or just check by path existence via a sibling section lookup #}
```

Or fall back to an unconditional include and accept that years without `intro.md` will fail. Since we're creating `intro.md` for both 2025 and 2026, this is safe in practice; year-template scaffolding (Phase 6) ensures future years get an `intro.md` too.

If `required=false` isn't supported, simpler version:

```html
{% extends 'base.html' %}

{% block content %}
  {% set intro = get_page(path=year_dir ~ "/intro.md") %}
  {{ intro.content | safe }}
  {{ section.content | safe }}
{% endblock %}
```

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

- [ ] **Step 4: Verify in browser.**

```bash
nix develop -c zola serve
# Visit /2025/ and confirm "Welcome to Nix Vegas / Nixpkgs ..." intro renders correctly
# Visit /2026/ and confirm sponsors content renders correctly
```

Expected: 2025 home shows intro content (from intro.md, formerly offsite.md) above section content (sponsors). 2026 home shows empty intro (the file is empty/nearly-empty markdown) and the CFP/sponsors section content.

- [ ] **Step 5: Commit Tasks 5.1 and 5.2 together.**

```bash
git add -A
git commit -m "templates: rename offsite.md -> intro.md; render unconditionally"
```

---

### Task 5.3: Create `templates/onsite.html` and update onsite content frontmatter

**Files:**
- Create: `templates/onsite.html`
- Modify: `content/2025/onsite.md` (frontmatter)
- Modify: `content/2026/onsite.md` (frontmatter)

- [ ] **Step 1: Create the template:**

```html
{% extends 'base.html' %}

{% block content %}
  {{ page.content | safe }}
{% endblock %}
```

- [ ] **Step 2: Update `content/2025/onsite.md` frontmatter.** Read it first:

```bash
sed -n '1,3p' content/2025/onsite.md
```

Expected: empty frontmatter (`---\n---\n`).

Replace with:

```yaml
---
template: "onsite.html"
title: "Onsite"
---
```

- [ ] **Step 3: Same for `content/2026/onsite.md`. (If the file doesn't exist, create it with the same frontmatter and an empty body.)**

```bash
ls content/2026/onsite.md
```

If absent:

```bash
cat > content/2026/onsite.md <<'EOF'
---
template: "onsite.html"
title: "Onsite"
---
EOF
```

- [ ] **Step 4: Build.**

```bash
nix build .#default
```

- [ ] **Step 5: Verify in browser.**

```bash
nix develop -c zola serve
# Visit /2025/onsite — should render with binary cache / ISO content (shortcodes may render with empty data; that's expected for non-onsite builds)
```

- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "templates: add standalone onsite.html template; onsite is now a regular page"
```

---

### Task 5.4: Remove `config.extra.onsite` from `config.toml`

**Files:**
- Modify: `config.toml`

- [ ] **Step 1: Read current `[extra]` block.**

```bash
sed -n '14,30p' config.toml
```

- [ ] **Step 2: Delete the line `onsite = false` (and the comment line above it if it's specific to that field). Also remove the now-unused onsite data fields:**

Delete these lines from the `[extra]` block:

```toml
# Set to true if we are building the onsite version.
onsite = false

# Configuration for onsite resources.
nixos_version = ""
nixpkgs_rev = ""
isos = []
vmas = []
channel = ""
manual = ""
search = ""
```

After edit, `[extra]` should contain only: `og_preview_img`, `twitter_site`, `twitter_user`, `masto_user`, `timezone`, `current_year`, `cfp_year`.

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

Expected: builds. The shortcodes (`nixosIsos`, `nixpkgsRev`, etc.) reference `config.extra.isos`, `config.extra.nixpkgs_rev` etc. which are now removed. Zola/Tera typically returns an empty value for missing config keys rather than erroring — confirm. If it errors, two options:
- (a) Restore the fields with empty defaults
- (b) Remove the shortcodes entirely (they have no purpose without the data)

Recommend (a) for now to minimize scope; (b) is a follow-up cleanup.

If (a): restore the lines but keep `onsite = false` removed:

```toml
# Empty config slots formerly populated by the dropped onsite build
nixos_version = ""
nixpkgs_rev = ""
isos = []
vmas = []
channel = ""
manual = ""
search = ""
```

- [ ] **Step 4: Update navigation to remove the `config.extra.onsite` branch.**

Edit `templates/components/navigation.html`. Remove the entire `{% if config.extra.onsite %}` ... `{% else %}` branch and keep only what was in the `{% else %}` block. The file should now read:

```html
{% set current_year = config.extra.current_year %}
{% set viewing_current_year = (year_dir == current_year) or (year_dir == "") %}

<header>
  <nav class="nav-header container">
    <ul>
      <li><a href="/">Home</a></li>
      {% if year_dir %}
        <li><a href="/{{ year_dir }}/">{{ year_dir }} event</a></li>
        <li><a href="/{{ year_dir }}/#sponsors">Sponsors</a></li>
        <li><a href="/{{ year_dir }}/about">About</a></li>
        <li><a href="/{{ year_dir }}/schedule">Schedule</a></li>
        <li><a href="/{{ year_dir }}/speakers">Speakers</a></li>
        <li><a href="/{{ year_dir }}/onsite">Onsite</a></li>
        {% if not viewing_current_year %}
          <li><a href="/{{ current_year }}/">Current event →</a></li>
        {% endif %}
      {% else %}
        <li><a href="/{{ current_year }}/">Current event</a></li>
        <li><a href="/{{ current_year }}/about">About</a></li>
        <li><a href="https://cfp.nix.vegas/{{ config.extra.cfp_year }}">CFP</a></li>
      {% endif %}
      <li><a href="/blog">Blog</a></li>
    </ul>
  </nav>
</header>
```

Added: "Onsite" link inside the year-scoped branch.

- [ ] **Step 5: Update `templates/components/hero.html` to remove the `{% if config.extra.onsite %}` conditional on the wrapper class.**

Read current:

```bash
sed -n '1,10p' templates/components/hero.html
```

Replace:

```html
{% if config.extra.onsite %}
<div class="hero-wrapper rgb onsite">
{% else %}
<div class="hero-wrapper rgb">
{% endif %}
```

With:

```html
<div class="hero-wrapper rgb">
```

- [ ] **Step 6: Search the codebase for any other `config.extra.onsite` references.**

```bash
grep -rn "config.extra.onsite" templates/ content/
```

Expected: none. If any remain, remove the conditional usage.

- [ ] **Step 7: Build.**

```bash
nix build .#default
```

- [ ] **Step 8: Verify in browser.**

```bash
nix develop -c zola serve
# Click through /, /2026/about, /2025/about, /2025/onsite, /blog
```

Confirm everything renders. Onsite link appears in year-scoped nav. No visual regressions on hero (the `.onsite` class wasn't actually styled, so removing it should be invisible — verify in `sass/components/hero.scss`).

- [ ] **Step 9: Commit.**

```bash
git add -A
git commit -m "templates: drop config.extra.onsite branching"
```

---

### Task 5.5: Drop `nixVegasOnsite` flake output and `onsite.nix` derivation

**Files:**
- Modify: `flake.nix`
- Modify: `pkgs/nix-vegas-site/default.nix`
- Delete: `pkgs/nix-vegas-site/onsite.nix`

- [ ] **Step 1: Read `flake.nix`.**

```bash
cat flake.nix
```

- [ ] **Step 2: Edit the `packages` block to remove `nixVegasOffsite` and `nixVegasOnsite` outputs. After edit, the `packages` attribute should read:**

```nix
          packages = {
            default = pkgs.nix-vegas-site;
          };
```

(Removing both `nixVegasOffsite` and `nixVegasOnsite`. The former was identical to `default`; the latter is the dropped onsite build.)

- [ ] **Step 3: Edit `pkgs/nix-vegas-site/default.nix` to remove `passthru.onsite`.**

The line:

```nix
  passthru.onsite = callPackage ./onsite.nix args;
```

Should be deleted, along with the `callPackage` arg if no longer needed. After edit, the file reads:

```nix
{
  stdenv,
  zola,
  ...
}@args:

stdenv.mkDerivation {
  name = "nix-vegas-site";
  src = ../..;
  buildInputs = [
    zola
  ];
  buildPhase = ''
    runHook preBuild
    zola build --output-dir public
    runHook postBuild
  '';
  installPhase = ''
    runHook preInstall
    mkdir -p $out
    mv public $out/
    runHook postInstall
  '';
}
```

(`callPackage` removed from the args destructure because it's no longer used.)

- [ ] **Step 4: Delete `pkgs/nix-vegas-site/onsite.nix`.**

```bash
git rm pkgs/nix-vegas-site/onsite.nix
```

- [ ] **Step 5: Build to confirm the flake still evaluates.**

```bash
nix flake check
nix build .#default
```

Expected: both succeed. `nix build .#nixVegasOnsite` would fail (good — it's gone).

- [ ] **Step 6: Verify `nix build .#nixVegasOnsite` is gone.**

```bash
nix build .#nixVegasOnsite 2>&1 | grep -i "does not provide\|attribute\|error"
```

Expected: error message indicating the attribute no longer exists.

- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "flake: drop nixVegasOnsite output and pkgs/nix-vegas-site/onsite.nix"
```

Phase 5 complete.

---

## Phase 6: Scaffolding script

**Goal of phase:** `./script/new-year YYYY` creates `content/YYYY/`, `data/YYYY/`, `static/img/YYYY/`, updates `config.toml`, and rewrites the current-year block in `static/_redirects`.

### Task 6.1: Create `script/year-template/` skeleton

**Files:**
- Create: `script/year-template/_index.md`
- Create: `script/year-template/hero.md`
- Create: `script/year-template/intro.md`
- Create: `script/year-template/about/_index.md`
- Create: `script/year-template/schedule.md`
- Create: `script/year-template/speakers.md`
- Create: `script/year-template/sponsors.md`
- Create: `script/year-template/onsite.md`

- [ ] **Step 1: Create the skeleton directory.**

```bash
mkdir -p script/year-template/about
```

- [ ] **Step 2: Create `script/year-template/_index.md`:**

```markdown
---
template: "year_home.html"
title: "Home"

extra:
  favicon_ico: "/img/favicon.ico"
  favicon_16: "/img/favicon-16x16.png"
  favicon_32: "/img/favicon-32x32.png"
  favicon_48: "/img/favicon-48x48.png"
  favicon_512: "/img/favicon.png"
  hero_img: "/img/YYYY/nix-vegas.png"
  hero_glitch_imgs: []
  event_dates: "TBD"
  event_location: "Las Vegas Convention Center"
  event_defcon: "DEF CON NN"
  event_defcon_url: "https://defcon.org/"
  event_tagline: ""
---

## Theme

Describe this year's theme here.

## CFP

CFP is open until DATE. Submit at [Pretalx](https://cfp.nix.vegas/YYYY).

## Sponsors

Interested in sponsoring? Email <sponsor@nix.vegas>.
```

(`YYYY` and `NN` are literal strings the user fills in after running the script. The script does NOT do template substitution on these — the placeholder convention is "find-and-replace `YYYY` after running.")

- [ ] **Step 3: Create `script/year-template/hero.md`:**

```html
---
title: "Hero"
---
<figure class="brand">
    <h1 class="hero-title"><span><a href="/">Nix Vegas</a></span></h1>
    <h2 class="hero-title"><span>TAGLINE GOES HERE</span></h2>
    <h3 class="hero-subtitle"><span>DATES, at <a target="_blank" href="https://defcon.org">DEF CON NN</a></span></h3>
</figure>
```

- [ ] **Step 4: Create `script/year-template/intro.md`:**

```markdown
---
---

## Welcome

Optional intro/theme content rendered above the main page content. Delete this file if not needed.
```

- [ ] **Step 5: Create `script/year-template/about/_index.md`:**

```markdown
---
template: "about.html"
title: "About"
---

## About

About the event this year.

## Location

**When:** DATES

**Where:** Las Vegas Convention Center, 2901 S Las Vegas Blvd, Las Vegas, NV 89109

**Registration:** A DEF CON badge will get you full access.

## Contact

- General: <noc@nix.vegas>
- CFP: <cfp@nix.vegas>
- Sponsorships: <sponsor@nix.vegas>
```

- [ ] **Step 6: Create `script/year-template/schedule.md`:**

```markdown
---
template: "schedule.html"
title: "Schedule"
---
```

- [ ] **Step 7: Create `script/year-template/speakers.md`:**

```markdown
---
template: "speakers.html"
title: "Speakers"
---
```

- [ ] **Step 8: Create `script/year-template/sponsors.md`:**

```markdown
---
title: "Sponsors"
---

## Sponsors

This year's sponsors:

>[![Sponsor name](/img/sponsors/Sponsor.svg)](https://example.com)
```

- [ ] **Step 9: Create `script/year-template/onsite.md`:**

```markdown
---
template: "onsite.html"
title: "Onsite"
---

Onsite content (binary cache info, ISOs, etc.) — fill in if running an onsite kiosk this year.
```

- [ ] **Step 10: Commit.**

```bash
git add script/year-template/
git commit -m "script: add year-template skeleton for new-year scaffolding"
```

---

### Task 6.2: Write `script/new-year`

**Files:**
- Create: `script/new-year`

- [ ] **Step 1: Create the script.**

```bash
#!/usr/bin/env nix-shell
#!nix-shell -i bash -p coreutils

# new-year YYYY — scaffolds a new event year.
#
# Creates:
#   content/YYYY/  (copied from script/year-template/)
#   data/YYYY/{schedule,speakers-filtered}.json (empty arrays)
#   static/img/YYYY/.gitkeep
#
# Updates:
#   config.toml   sets extra.current_year = "YYYY" (and prompts about cfp_year)
#   static/_redirects   rewrites the BEGIN/END current-year block

set -euo pipefail

if [ $# -ne 1 ]; then
    echo "Usage: $0 <year>" >&2
    echo "Example: $0 2027" >&2
    exit 1
fi

YEAR=$1
if [[ ! "$YEAR" =~ ^[0-9]{4}$ ]]; then
    echo "Error: year must be 4 digits, got: $YEAR" >&2
    exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

if [ -d "content/$YEAR" ]; then
    echo "Error: content/$YEAR already exists. Aborting." >&2
    exit 1
fi

echo "Scaffolding new event year: $YEAR"

# 1. Copy template
echo "  -> content/$YEAR/ (from script/year-template/)"
cp -r script/year-template "content/$YEAR"

# 2. Empty data files
echo "  -> data/$YEAR/{schedule,speakers-filtered}.json"
mkdir -p "data/$YEAR"
echo "[]" > "data/$YEAR/schedule.json"
echo "[]" > "data/$YEAR/speakers-filtered.json"

# 3. Static image dir
echo "  -> static/img/$YEAR/.gitkeep"
mkdir -p "static/img/$YEAR"
touch "static/img/$YEAR/.gitkeep"

# 4. Rewrite current-year block in static/_redirects
REDIRECTS_FILE="static/_redirects"
if [ ! -f "$REDIRECTS_FILE" ]; then
    echo "Error: $REDIRECTS_FILE not found." >&2
    exit 1
fi

echo "  -> updating $REDIRECTS_FILE"
NEW_BLOCK="# BEGIN current-year
/about     /$YEAR/about      301
/schedule  /$YEAR/schedule   301
/speakers  /$YEAR/speakers   301
# END current-year"

# Use awk to swap the block atomically
awk -v new_block="$NEW_BLOCK" '
    /^# BEGIN current-year/ { print new_block; in_block=1; next }
    /^# END current-year/   { in_block=0; next }
    !in_block               { print }
' "$REDIRECTS_FILE" > "$REDIRECTS_FILE.tmp"
mv "$REDIRECTS_FILE.tmp" "$REDIRECTS_FILE"

# 5. Update config.toml current_year
echo "  -> config.toml: current_year = \"$YEAR\""
# Match `current_year = "..."` line under [extra]
sed -i -E "s/^current_year = \"[0-9]+\"/current_year = \"$YEAR\"/" config.toml

# Verify
if ! grep -q "^current_year = \"$YEAR\"" config.toml; then
    echo "Warning: failed to update current_year in config.toml. Edit by hand." >&2
fi

# 6. Prompt about cfp_year
read -p "Update cfp_year to $YEAR too? [y/N] " UPDATE_CFP
if [[ "$UPDATE_CFP" =~ ^[Yy]$ ]]; then
    sed -i -E "s/^cfp_year = \"[0-9]+\"/cfp_year = \"$YEAR\"/" config.toml
    echo "  -> config.toml: cfp_year = \"$YEAR\""
fi

# 7. Next steps
cat <<EOF

Done. Next steps:

  1. Edit content/$YEAR/_index.md — fill in event_dates, event_defcon, event_tagline, theme/CFP/sponsors copy.
  2. Edit content/$YEAR/hero.md — fill in TAGLINE, DATES, DEF CON NN.
  3. Edit content/$YEAR/about/_index.md — fill in dates and location.
  4. Replace YYYY/NN placeholders throughout content/$YEAR/.
  5. (Optional) Add hero/glitch art to static/img/$YEAR/ and reference in _index.md.
  6. When CFP is open: ./script/refresh-data.sh $YEAR <sessionize-all-url>
  7. git add . && git commit -m "content: scaffold $YEAR event"
EOF
```

- [ ] **Step 2: Make executable.**

```bash
chmod +x script/new-year
```

- [ ] **Step 3: Commit (script not yet tested).**

```bash
git add script/new-year
git commit -m "script: add new-year scaffolding command"
```

---

### Task 6.3: Test `script/new-year` with a throwaway year

- [ ] **Step 1: Run for year 9999.**

```bash
./script/new-year 9999 <<< ""
```

(The `<<< ""` provides empty input to the cfp_year prompt; the default is "N".)

- [ ] **Step 2: Verify the artifacts.**

```bash
ls content/9999 data/9999 static/img/9999
cat data/9999/schedule.json
cat data/9999/speakers-filtered.json
grep current_year config.toml
head -7 static/_redirects
```

Expected:
- `content/9999/` contains all template files
- `data/9999/schedule.json` is `[]`
- `data/9999/speakers-filtered.json` is `[]`
- `static/img/9999/.gitkeep` exists
- `config.toml` has `current_year = "9999"`
- `static/_redirects` BEGIN block redirects to `/9999/...`

- [ ] **Step 3: Confirm the site builds.**

```bash
nix build .#default
```

Expected: builds. Some pages under `/9999/` will look broken because the template placeholders (TAGLINE, DATES, NN) aren't filled in — that's OK, the test is whether the scaffolding mechanism works.

- [ ] **Step 4: Clean up the throwaway year.**

```bash
rm -rf content/9999 data/9999 static/img/9999
sed -i 's/current_year = "9999"/current_year = "2026"/' config.toml
# Restore _redirects to 2026 by re-running new-year against 2026
./script/new-year 2026 <<< ""
# But new-year will refuse because content/2026 exists. Instead, manually edit _redirects:
```

Actually this manual restoration is fiddly. Simpler approach for the test:

- [ ] **Step 4 (revised): Use git to revert the test changes.**

```bash
git checkout -- config.toml static/_redirects
rm -rf content/9999 data/9999 static/img/9999
```

- [ ] **Step 5: Verify clean state.**

```bash
git status
```

Expected: no changes.

- [ ] **Step 6: Confirm build still works.**

```bash
nix build .#default
```

- [ ] **Step 7: No commit — this task is verification only.**

Phase 6 complete.

---

## Phase 7: Cleanup

**Goal of phase:** Remove vestigial files identified during the migration.

### Task 7.1: Delete `templates/components/speakers_list.html`

The file is empty and unused.

**Files:**
- Delete: `templates/components/speakers_list.html`

- [ ] **Step 1: Confirm the file is empty and unused.**

```bash
wc -l templates/components/speakers_list.html
grep -rn "speakers_list" templates/ content/ sass/
```

Expected: 0 lines, no references.

- [ ] **Step 2: Delete.**

```bash
git rm templates/components/speakers_list.html
```

- [ ] **Step 3: Build.**

```bash
nix build .#default
```

- [ ] **Step 4: Commit.**

```bash
git commit -m "templates: remove empty unused speakers_list.html"
```

---

### Task 7.2: Audit for other vestigial files

- [ ] **Step 1: Confirm `templates/blog_templates/` is gone (removed in Task 4.6).**

```bash
ls templates/blog_templates 2>/dev/null && echo "still exists" || echo "removed"
```

Expected: "removed".

- [ ] **Step 2: Confirm no stray references to the old `home.html` template name.**

```bash
grep -rn 'template: "home.html"' content/ templates/
grep -rn "home.html" templates/
```

Expected: no matches in `content/`. Matches in `templates/` are fine if they're in comments referring to the old name.

- [ ] **Step 3: Confirm no stray references to `social-bar.html` (the hyphenated old name).**

```bash
grep -rn "social-bar" templates/ sass/
```

Expected: no matches.

- [ ] **Step 4: Confirm `pkgs/nix-vegas-site/onsite.nix` is gone (removed in Task 5.5).**

```bash
ls pkgs/nix-vegas-site/
```

Expected: only `default.nix`.

- [ ] **Step 5: If the audit surfaced any unexpected leftovers, address them in additional commits with messages like `cleanup: remove <file> (made vestigial by <feature>)`.**

---

### Task 7.3: Final smoke test

- [ ] **Step 1: Clean build.**

```bash
nix build .#default
```

- [ ] **Step 2: Serve.**

```bash
nix develop -c zola serve
```

- [ ] **Step 3: Visit and verify each URL renders correctly:**

| URL | Verification |
|---|---|
| `/` | Evergreen root: project hero, current-event callout (DEF CON 34), about, recent posts, past events list (2025), contact |
| `/2026/` | 2026 home: hero (DEF CON 34), CFP section, sponsors section |
| `/2026/about` | 2026 about: August 6–9 2026 |
| `/2026/onsite` | Renders (likely empty body for 2026 stub) |
| `/2025/` | 2025 archive home: glitch hero "Rebuild the World", intro + sponsors |
| `/2025/about` | 2025 about: August 7–10 2025 |
| `/2025/schedule` | 2025 schedule from `data/2025/schedule.json` |
| `/2025/speakers` | 2025 speakers from `data/2025/speakers-filtered.json` |
| `/2025/onsite` | 2025 onsite content (binary cache, ISOs — shortcodes render with empty data) |
| `/blog` | Grouped by year: "2025" heading with 4 posts |
| `/blog/2025/2025-retrospective` | Post renders |
| `/blog/2025/dc32-nixmesh` | Post renders, `#sponsors` link points at `/2025/#sponsors` |

- [ ] **Step 4: Verify redirects file ships correctly.**

```bash
cat result/public/_redirects
```

Expected: BEGIN/END current-year block pointing at 2026; permanent blog redirects active (not commented).

- [ ] **Step 5: Stop server.**

Phase 7 complete.

---

## Final verification checklist

After all phases land, do a holistic review:

- [ ] **Step 1: All commits push cleanly.**

```bash
git log --oneline main..HEAD
```

Expected: a clean linear history of phase commits.

- [ ] **Step 2: No `current_path` regex anywhere in templates.**

```bash
grep -rn "current_path" templates/
```

Expected: no matches.

- [ ] **Step 3: No `config.extra.onsite` references.**

```bash
grep -rn "config.extra.onsite" .
```

Expected: no matches (excluding `.git/`).

- [ ] **Step 4: No flat blog post files (all under year folders).**

```bash
ls content/blog/*.md
```

Expected: only `_index.md`. All other posts are under `content/blog/YYYY/`.

- [ ] **Step 5: `nix flake check` passes.**

```bash
nix flake check
```

Expected: success.

- [ ] **Step 6: `nix build .#default` succeeds.**

```bash
nix build .#default
```

Expected: success.

- [ ] **Step 7: `nix build .#nixVegasOnsite` fails (the output is gone).**

```bash
nix build .#nixVegasOnsite 2>&1 | grep -i "error\|does not"
```

Expected: error message.

- [ ] **Step 8: Push the branch and open a PR (or PRs) for review.**

```bash
git push -u origin site-improvements
```

Open PR against `main`. Recommend splitting into 2-3 PRs (Phase 1+2+3, Phase 4+5, Phase 6+7) for review tractability.

Migration complete.
