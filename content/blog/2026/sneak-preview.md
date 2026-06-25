---
template: "blog_post.html"
title: "Extended CFP, and a sneak preview"
authors: ["Nix Vegas Team"]
description: "Get a preview of this year's Nix Vegas talks in advance of DEF CON"
date: "2026-06-24"
---

Attention all DEF CON 34 attendees! We are extending our CFP to **July 15**.
You can submit on [Pretalx](https://cfp.nix.vegas/2026) — and remember, we have
two tracks this year: a call for presentations and a call for projects, so you
can show off a project even if you'd rather not give a talk.

We're also grateful that [Flox](https://flox.dev) is sponsoring badges for our
speakers this year. DEF CON badges aren't
[cheap](/img/blog/2026-sneak-preview/defcon34-ticket-price.png), so this is a
real help for everyone who steps up to share their work — one more reason to
get your submission in.

In the meantime, here are some sessions to look forward to in advance of the
full conference schedule...

## NixOS Workspaces

JB

Working on multiple projects simultaneously? Display getting cluttered? Agents
in a race condition all trying to fight over the same ports and browser agents?

This presentation introduces NixOS Workspaces, a method of partitioning
environments for local and remote development. Workspaces assist concurrent
agentic development workflows by reducing risk and facilitating common
environment configurations across projects. NixOS workspaces is backed by
nixos-containers, a wrapper on systemd-nspawn.

Presentation includes a demo of the workflow, architecture, guidance on modes
of deployment, security considerations, and installation guidance.

## Running a homelab with NixOS

ahoneybun

Are you looking to self host some services like Movies/TV, Music, Audiobooks
and more with NixOS? It is really simple!

## Nix Knows When the Agent Is Wrong

Jason Odoom

I built a tool to help maintainers patch nixpkgs CVEs faster. But I optimized
the wrong thing.

The tool - Vulnpatch, is a dashboard. It pulls together CVE intelligence,
triages by what is actually being exploited, gives the maintainer the context
they need and gets out of the way. The assumption underneath it was that the
maintainer is the bottleneck: speed up the workflow and packages get patched
faster.

I no longer believe that assumption. I was already building Vulnpatch to
automate the remediation work when Mythos was announced, and it undercut the
premise. Building a product to do what a frontier model could now do on its own
was the wrong problem to be solving.

The difficult part was never automating the work. It is making an agent's
output something a volunteer on the security team can actually trust. The work
is the evidence: which package is actually affected, which upstream commit
fixes it, what the new hash is, whether it still builds, whether the tests
still pass and whether a maintainer has any reason to trust it. And that is
before the non-trivial cases: the patches that are not simple version bumps or
hash updates.

This is a talk about that shift. I will discuss Vulnpatch and Trace, an
agent-owned nixpkgs fork that produces signed, reproducible CVE evidence
bundles instead of drive-by pull requests. And I want to make one argument I
think is worth taking seriously: Nix is unusually well-suited to AI agents
because it provides strong automated feedback. Reproducible builds and
passthru.tests give agents an objective verifier for many changes, whereas most
repositories offer much weaker validation.

Patches are cheap. Proof is not. I will show what it takes to make an agent's
work auditable enough to be worth a maintainer's time and I hope, to persuade
maintainers that agents belong in their workflow. The workflows we built for
human-only contribution will not survive contact with agents unchanged.

## Compiling the World: A Binary Dataset Built from nixpkgs

Chris Connelly

Reverse engineering binaries is slow, detailed work, but it's one of the few
ways we have to verify what some software actually does. Machine learning might
help improve some of those challenges, but only if you have high-quality,
real-world ground truth to train and evaluate on. At MIT Lincoln Laboratory, we
have built a large dataset for machine learning on x86_64 binaries using
nixpkgs, taking advantage of Nix's reproducibility, package coverage, and
instrumentable build environments.

We compiled tens of thousands of C, C++, Rust, and Go packages, often multiple
versions of each, with consistent compiler flags, captured source files, and
debug information. From these, we extracted roughly 50 million functions and
aligned with their source code and short descriptions. Possible applications
include fine-tuning large language models for various binary tasks or training
custom, highly efficient models for binary code understanding.

I'll walk through what it takes to wrangle nixpkgs in an HPC environment at this
scale and show how open build tooling like Nix can help us to better understand
and analyze the software that we all depend on.
