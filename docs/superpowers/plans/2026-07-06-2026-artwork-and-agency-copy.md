# 2026 Artwork Post + Agency Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two content PRs: the 2026 artwork announcement blog post, and the "Agency" theme copy for the 2026 year home.

**Architecture:** Pure content changes on a Zola static site. Each PR lives on its own branch in its own git worktree; the copy below is final draft prose (mirroring the 2025 precedents) that the user reviews in the PR / deploy preview. Spec: `docs/superpowers/specs/2026-07-06-2026-artwork-and-agency-copy-design.md`.

**Tech Stack:** Zola (markdown content, Tera templates), nix dev shell for `zola build`.

## Global Constraints

- **Task 1 works in** `/home/djacu/dev/nixvegas/worktrees/2026-artwork-post` (branch `djacu/2026-artwork-post`); **Task 2 works in** `/home/djacu/dev/nixvegas/worktrees/2026-agency-copy` (branch `djacu/2026-agency-copy`). Verify with `git branch --show-current` before starting. Never work in `/home/djacu/dev/nixvegas/nix.vegas` (the user's checkout, on `main`).
- Build with `nix develop --command zola build` (zola is not on PATH outside the dev shell; the "Git tree is dirty" warning is normal).
- The prose below is the deliverable — copy it **verbatim**. Do not rewrite, "improve", or reformat it. Trailing/leading blank lines and the `----` horizontal rules are intentional (they mirror `content/blog/2025/artwork.md`).
- Commits: repo style `area: lowercase imperative summary`. NEVER add Co-Authored-By or any AI trailer.
- No cipher footer, no new image assets, no changes to `content/2026/hero.md`.
- External links in the copy were verified 2026-07-06 (theoi.com ×3, defcon.org: HTTP 200; search.nixos.org links use current stable channel 25.11 with both options confirmed to exist).

---

### Task 1: 2026 artwork announcement blog post (PR A)

**Files:**
- Create: `content/blog/2026/artwork.md`

**Interfaces:**
- Consumes: `static/img/2026/nix-vegas.png` (already on main), blog conventions from `content/blog/2026/sneak-preview.md`.
- Produces: the post at `/blog/2026/artwork/` — Task 2's `_index.md` edit links this exact URL.

- [ ] **Step 1: Create `content/blog/2026/artwork.md`**

Exact content:

```markdown
---
template: "blog_post.html"
title: "Nix Vegas 2026 artwork announcement"
authors: ["Nix Vegas Team", "Kenz Tobias"]
description: "Introducing the 2026 Nix Vegas art, by Kenz Tobias!"
date: "2026-07-06"
---

----

We are excited to announce the official [artwork](/img/2026/nix-vegas.png) for Nix Vegas 2026,
once again by Kenz Tobias, an artist from Vista, CA.

_You can follow Kenz on [Twitch](https://www.twitch.tv/kenz_tobias_art) and [Instagram](https://www.instagram.com/kenz_tobias_art/)_!

----

![](/img/2026/nix-vegas.png)

----

## Theme

DEF CON's theme this year is [Agency](https://defcon.org/html/defcon-34/dc-34-theme.html) —
"self-determination. It's about making choices that increase yours, AND helping others to
control theirs." Our answer is **Escape Your Fate**, and last year's Norse mythology gives way
to Greek:

- The charioteer is [Nyx](https://www.theoi.com/Protogenos/Nyx.html), the primordial goddess
  of Night, driving her chariot across the sky. (Nyx. [Nix](https://nixos.org/). We couldn't
  resist.)
- The giant hand is the hand of fate: the [Moirai](https://www.theoi.com/Daimon/Moirai.html),
  the Fates who spin, measure, and cut the thread of your life. Ours spins forced updates,
  algorithmic feeds, and SaaS that shifts under your feet — with an unblinking eye in its
  palm, watching you while it steers.
- Look at Nyx's hand: she holds a thread of fate, taken back from the Moirai. That's what
  [Nix](https://github.com/NixOS/nixpkgs) hands you — a system whose every package and
  service is declared, pinned, and [reproducible](https://reproducible.nixos.org/). Your
  world, spun from a thread you hold.
- One more layer for the mythology nerds: in Hesiod's
  [Theogony](https://www.theoi.com/Text/HesiodTheogony.html), the Moirai are daughters of
  Nyx. Fate isn't handed down from on high — it's made. And what is made can be remade.

## Ideas

The [CFP](https://cfp.nix.vegas/2026) is open until **July 15, 2026**, and our challenge to
you is the one the artwork makes:

- Starve the beast: how can you use Nix and NixOS to reclaim your digital agency?
- Feed your community: how can we support others doing the same by rolling our own tools and
  build infrastructure?
- Resources, time, and energy: how can we use Nix to connect ordinary users with the
  developers who made all the software they depend on?

We're excited to see everyone this year at DEF CON.

<3,
The Nix Vegas Team
```

- [ ] **Step 2: Build and verify the rendered post**

```bash
cd /home/djacu/dev/nixvegas/worktrees/2026-artwork-post
nix develop --command zola build
ls public/blog/2026/artwork/index.html
grep -c "Escape Your Fate" public/blog/2026/artwork/index.html
grep -c "img/2026/nix-vegas.png" public/blog/2026/artwork/index.html
grep -c "artwork" public/blog/index.html
```

Expected: build succeeds; the file exists; first grep prints `1`; second prints ≥ 2 (announcement link + image embed — markdown-rendered hrefs contain the literal path); third prints ≥ 1 (post listed in the blog index).

- [ ] **Step 3: Commit**

```bash
cd /home/djacu/dev/nixvegas/worktrees/2026-artwork-post
git add content/blog/2026/artwork.md
git commit -m "blog: announce the 2026 artwork by Kenz Tobias"
```

---

### Task 2: Agency theme copy for the 2026 year home (PR B)

**Files:**
- Modify: `content/2026/intro.md` (add body below the empty front matter)
- Modify: `content/2026/_index.md` (replace one stale sentence)

**Interfaces:**
- Consumes: `templates/year_home.html` renders `content/2026/intro.md` at the top of `/2026/`; Task 1's post URL `/blog/2026/artwork/` (PR A merges first; the link 404s on this branch's own preview until then, which is expected).
- Produces: nothing downstream.

- [ ] **Step 1: Write `content/2026/intro.md`**

Replace the whole file with exactly:

```markdown
---
---

## Agency

_Nyx rides tonight, and in her hand she holds a thread of fate — hers now, not the
[Moirai](https://www.theoi.com/Daimon/Moirai.html)'s. You don't have to bargain with the hand
of fate for control of your own computer: with [Nix](https://nixos.org/), every package,
every service, every line of your system is a thread you hold, inspect, and re-spin at will._

DEF CON's theme this year is [Agency](https://defcon.org/html/defcon-34/dc-34-theme.html):
self-determination — making choices that increase your own agency, and helping others control
theirs. That has been the Nix project's work for two decades. In a world of forced updates,
dark patterns, and feeds tuned by someone else's incentives, [NixOS](https://nixos.org/) lets
you run your world instead: a single line of configuration enables stable, self-hosted
replacements for services as varied as
[Google Photos](https://search.nixos.org/options?channel=25.11&show=services.immich.enable&from=0&size=50&sort=relevance&type=packages&query=immich)
or
[Slack](https://search.nixos.org/options?channel=25.11&show=services.mattermost.enable&from=0&size=50&sort=relevance&type=packages&query=mattermost),
deployed repeatably across as many machines as you want. Starve the beast — it was never
feeding you anyway.

And agency doesn't stop at your own machines; it counts double when you hand it to someone
else. Build your software with Nix and it runs the same way on any Linux distribution, over
and over, with [reproducible builds](https://reproducible.nixos.org/) you can verify rather
than trust. Spin up a development shell so friends and coworkers get the exact same
environment you have. Package the thing you rolled yourself and contribute it back to
[nixpkgs](https://github.com/NixOS/nixpkgs), where upwards of 120,000 packages are maintained
in the open by people who decided their software should answer to its users.

Access to services and software everywhere, on your own terms: that's Nix. Welcome to Nix
Vegas, where you escape your fate.
```

- [ ] **Step 2: Fix the stale sentence in `content/2026/_index.md`**

Find this exact text (body, under `## DEF CON 34 Theme: Agency`):

```markdown
While we are still hard at work on our art and theme this year, we
would like to challenge you to submit talks that answer to our take on the DEF
CON theme:
```

Replace it with:

```markdown
Our answer to it is [Escape Your Fate](/blog/2026/artwork/) — and we
would like to challenge you to submit talks that answer to our take on the DEF
CON theme:
```

Nothing else in the file changes; the three challenge bullets below it stay verbatim.

- [ ] **Step 3: Build and verify the rendered year home**

```bash
cd /home/djacu/dev/nixvegas/worktrees/2026-agency-copy
nix develop --command zola build
grep -c "escape your fate" public/2026/index.html
grep -c "Escape Your Fate" public/2026/index.html
grep -c "Moirai" public/2026/index.html
grep -c '"/blog/2026/artwork/"' public/2026/index.html
grep -c "still hard at work" public/2026/index.html || true
```

Expected: build succeeds; lowercase grep ≥ 1 (intro closing line); capitalized grep ≥ 1 (the `_index.md` link text); Moirai ≥ 1 (intro renders on the page); the href grep prints `1` (markdown-rendered links contain the literal path); the last grep prints `0` (stale sentence gone — `|| true` keeps the step from failing on grep's exit code).

- [ ] **Step 4: Commit**

```bash
cd /home/djacu/dev/nixvegas/worktrees/2026-agency-copy
git add content/2026/intro.md content/2026/_index.md
git commit -m "content/2026: add Agency theme copy and link the artwork post"
```
