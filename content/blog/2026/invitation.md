---
template: "blog_post.html"
title: "Meet other Nix users and play the Nix CTF at DEF CON 34"
authors: ["Nix Vegas Team"]
description: "Reclaim your agency with Nix Vegas, this year at DEF CON"
date: "2026-07-23"
---

Our CFP has come and gone, and our [schedule](/2026/schedule),
[art](/blog/2026/artwork), and [speaker list](/2026/speakers) are finally out.
It's time for a sneak preview of what we've been up to in the months leading up to DEF CON.

## The space

A detailed map is [here](https://defcon.org/html/defcon-34/dc-34-venue.html).

Nix Vegas and our main stage are on floor 1, space #1310 (pink), in a similar
location to last year. Enter through the north entrance of the LVCC and go all
the way down the exhibition hall until you see us.

We have a little more space than last year. Note that all communities have wireless
headsets for listening to talks to avoid audio traveling in the LVCC halls.
This means that we also have a dedicated spot for the talk audience now, instead of
needing to share it with the rest of the space. Hooray!

Also note that Chris Connelly's Community Stage talk ([Compiling the World: A Binary
Dataset Built from nixpkgs](https://info.defcon.org/defcon34/content/?id=66756))
is on Saturday from 11:30-12:00 on Creator Stage 7 (lime green).
You can check it out on Hacker Tracker or on [our schedule](https://cfp.nix.vegas/2026/talk/MVYVWQ/).

The rule of thumb is that the LVCC looks like a lambda and we are toward the
top, near the upper apex - see [page 7](https://brand.nixos.org/documents/nixos-branding-guide.pdf) 😉.

## Nix Vegas NOC

The NOC team has been making an effort to upgrade our network this year.
(Really, is any NixOS config ever truly done?)

Aside from our now self-hosted Pretalx, Immich, Owncast, website, and mail
server on EDIS Global (our cloud provider), we continue to make no assumptions
about internet connectivity during the world's largest hacker conference.

Here is what we're providing this year:

- We're running our first Nix CTF (it'll be at [https://nixc.tf](https://nixc.tf) and accessible
onsite). It's a jeopardy-style CTF that is both a gentle introduction to Nix
and challenge to use Nix and NixOS tools in creative ways.
- Ethernet and wifi are available in the space and egress the LVCC via a Nebula
VPN tunnel (wifi is WPA2/3 PSK, so bring an adapter to plug in if you're
worried about being packet captured at DEF CON).
- Talks will be streamed live at [https://live.nix.vegas](https://live.nix.vegas).
- We have a Forgejo nixpkgs mirror that you can also use as a git server at
[https://git.nixos.lv](https://git.nixos.lv). Also just accessible onsite.
- There's a Hydra builder building and substituting all of nixpkgs at
[https://hydra.nixos.lv](https://hydra.nixos.lv).
- We're bringing a binary cache with multiple terabytes of nixpkgs evals from
25.11, 26.05, and unstable accessible via harmonia onsite at
[https://cache.nixos.lv](https://cache.nixos.lv).
- We have NixOS ISOs and PXE netboot, with powerline ethernet to reach weird
corners of the LVCC, as always. Instructions will be at [https://nixos.lv](https://nixos.lv).
- We have a couple mesh networked [Protectli VP2420](https://protectli.com/product/vp2420/)
  machines for alternate ways into the event network.
- We have a Tenstorrent AI accelerator [QuietBox](https://tenstorrent.com/en/hardware/tt-quietbox) with llama-cpp.
- There will be coloring sheets for Kenz' [amazing art](/blog/2026/artwork), again.
- And plenty of [fantastic talks](/2026/schedule) by knowledgeable people.
- With potentially a few surprises[,](https://defcon.social/@nixvegas/116854893120904190) because it's DEF CON. (badge?)

We hope to see you there.

## In closing

Thank you to [https://nyx.net](https://nyx.net), one of the world's oldest ISPs that served the
Computing and Information Resources (CAIR<sup>*</sup>) BBS at the University of Denver, for
inspiration for this year's theme. We hope to keep a lot of this infrastructure
up year-round as we work to bring back the spirit of CAIR and Nyx for people
working on creative Nix and NixOS-related projects (and, yes, we donated).

See you in Vegas <3,

Nix Vegas Organizers

----

<small><sup>*</sup> An author of this blog post may have had a domain account on CAIR
in elementary school. Our elementary school was lucky enough to have 802.11b
access points installed by the University of Denver in the early 2000s, resulting
in a lot of kids learning how to use Linux and getting good at strange networking things
since we had full access to the campus network in middle school.
(Another fun fact: CAIR [had one of the first IRC servers](https://www.livinginternet.com/r/ri_irc.htm)).

We're hoping we're a small part of you discovering your own agency at DEF CON too.
Escape your fate!</small>
