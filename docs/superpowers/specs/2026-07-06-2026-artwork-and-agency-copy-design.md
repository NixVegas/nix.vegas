# 2026 artwork blog post + Agency theme copy

- **Date:** 2026-07-06
- **Status:** Design approved; ready for implementation plan.
- **Scope:** Two independent PRs, brainstormed together. PR A: `djacu/2026-artwork-post`.
  PR B: `djacu/2026-agency-copy`. Both branch from main at `0e1eb89`; each is built in
  its own git worktree under `~/dev/nixvegas/worktrees/`. This spec is committed on
  PR A's branch; PR B references it.

## Background

- **2025 precedents.** `content/blog/2025/artwork.md` announced the 2025 art by Kenz
  Tobias: credit + Twitch/Instagram links, embedded art, a `## Theme` section decoding
  the symbolism (Yggdrasil, branches → nixpkgs, roots → GC roots / roots of trust,
  Níðhögg coveting the Flake), an `## Ideas` section, `<3, The Nix Vegas Team`
  sign-off, and a cipher footer. The 2025 theme copy lives in `content/2025/intro.md`
  ("## Rebuild The World" + four paragraphs), rendered at the top of the year home by
  `templates/year_home.html` via `get_page(path=year_dir ~ "/intro.md")`.
- **2026 state.** The 2026 art is committed as `static/img/2026/nix-vegas.png` — the
  *Escape Your Fate* piece by the same artist, Kenz Tobias. `content/2026/intro.md`
  exists but is empty (front matter only). `content/2026/_index.md` has a
  `## DEF CON 34 Theme: Agency` section whose line "While we are still hard at work on
  our art and theme this year" is now stale, followed by three CFP challenge bullets
  that stay.
- **DEF CON 34 theme** (fetched from
  `https://defcon.org/html/defcon-34/dc-34-theme.html`): "Agency is self-determination.
  It's about making choices that increase yours, AND helping others to control theirs."
  Key phrases: "starve the beast", "rolling our own tools", rejecting surveillance
  capitalism, supporting community-driven alternatives.

## Artwork symbolism (provided by the team; authoritative)

- The **charioteer is Nyx**, the Greek primordial goddess of Night who drives her
  chariot across the sky. The **Nyx ↔ Nix** wordplay is intentional and gets center
  stage.
- The **giant hand is the "hand of fate"**, referring to the **Moirai** (the Fates),
  who spin, measure, and cut the thread of life.
- **Nyx holds a thread of fate** — she has taken it into her own hands.
- Drafted interpretation (Claude, to be reviewed in the PR): the hand of fate as
  everyone who decides your computing for you (forced updates, algorithmic feeds, SaaS
  changing underfoot); the held thread as the declarative, pinned, reproducible system
  state you hold with Nix; the **eye in the palm** as surveillance-while-being-steered
  (inference — flag in review); "Escape Your Fate" landing on "Agency is
  self-determination". Optional mythological layer: in Hesiod, the Moirai are Nyx's
  daughters — fate is made, and its thread can be taken back.
- Mythology references get links in the style of the 2025 post (e.g. Britannica for
  Nyx and the Moirai).

## PR A — artwork blog post

**File (new):** `content/blog/2026/artwork.md`

Front matter (2026 conventions — no aliases):

```yaml
template: "blog_post.html"
title: "Nix Vegas 2026 artwork announcement"
authors: ["Nix Vegas Team", "Kenz Tobias"]
description: "Introducing the 2026 Nix Vegas art, by Kenz Tobias!"
date: "2026-07-06"
```

Body structure, mirroring the 2025 post:
1. Announcement paragraph linking the art (`/img/2026/nix-vegas.png`), crediting Kenz
   Tobias with the same Twitch (`https://www.twitch.tv/kenz_tobias_art`) and Instagram
   (`https://www.instagram.com/kenz_tobias_art/`) links.
2. Embedded image: `![](/img/2026/nix-vegas.png)` — no vertical variant exists in the
   repo (2025 used `nix-vegas-vertical.png`); if a 2026 variant arrives later it can
   swap in.
3. `## Theme` — the symbolism section per above.
4. `## Ideas` — shorter than 2025's; ties to the three CFP challenge bullets from
   `content/2026/_index.md` and the July 15, 2026 CFP deadline with the Pretalx link
   (`https://cfp.nix.vegas/2026`).
5. Sign-off: `<3,` / `The Nix Vegas Team`. **No cipher footer** (2025's puzzle is
   team-authored; explicitly skipped).

## PR B — Agency theme copy

**File:** `content/2026/intro.md` (body added under the empty front matter)

`## Agency` + four paragraphs mirroring the 2025 intro's shape and length:
1. *Italic evocative lede* riffing on the artwork/theme — Nyx taking the thread of her
   own fate; your system's exact state as a thread you hold.
2. Reclaiming digital self-determination by self-hosting with NixOS — the "starve the
   beast" angle, with concrete `search.nixos.org` option links in the 2025 style
   (e.g. Immich for Google Photos, Mattermost for Slack, or similar).
3. Rolling your own tools and helping others do the same — reproducible builds, dev
   shells, contributing back to nixpkgs; "making choices that increase your agency AND
   helping others control theirs".
4. Closing paragraph landing the tagline: "Welcome to Nix Vegas" + agency.

**File:** `content/2026/_index.md` — replace the stale sentence
"While we are still hard at work on our art and theme this year, we would like to
challenge you to submit talks that answer to our take on the DEF CON theme:" with a
sentence that presents the finished take on the theme (linking the artwork blog post)
and still introduces the three challenge bullets, which are kept verbatim. The link
target is the PR A post's permalink (expected `/blog/2026/artwork/`, matching the
existing `/blog/2025/...` post URLs — verify against the built output during
implementation). **Ordering:** PR A merges first; PR B carries the
cross-link.

## Non-goals

- No new image assets (no vertical variant, no glitch images).
- No cipher footer.
- No hero/tagline changes (`content/2026/hero.md` untouched).
- No restructuring of `content/2026/_index.md` beyond the one stale sentence.

## Verification

- Both PRs: `nix develop --command zola build` clean; rendered pages checked in the
  worktree (`zola serve` or built HTML): PR A — post renders at its blog URL, appears
  in the 2026 blog index, image loads, links resolve; PR B — intro paragraphs render at
  the top of `/2026/`, theme section reads correctly, blog-post link resolves (once PR
  A is merged).
- Copy quality gate: the user reviews the actual prose in the PR / deploy preview;
  the drafted symbolism (esp. the eye-as-surveillance inference) is explicitly called
  out for review.
