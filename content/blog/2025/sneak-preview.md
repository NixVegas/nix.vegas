---
template: "blog_templates/base.html"
title: "Extended CFP, and a sneak preview"
authors: ["Nix Vegas Team"]
description: "Get a preview of this year's Nix Vegas talks in advance of DEF CON"
date: "2025-07-08"
---

Attention all DEF CON 33 attendees! We are extending our CFP to **July 31**. As a reminder, the Sessionize link is [over here...](http://sessionize.com/NixVegas)

In the meantime, here are some sessions to look forward to in advance of the full conference schedule...

## Rebuild The World: Access to secure software dependency management everywhere with Nix

[Tom Berek](https://hackertracker.app/person/?conf=DEFCON33&person=62152),
[Farid Zakaria](https://hackertracker.app/person/?conf=DEFCON33&person=62101),
[Daniel Baker](https://hackertracker.app/person/?conf=DEFCON33&person=62168),
moderated by [Morgan Jones](https://github.com/numinit)

_[Hacker Tracker link](https://hackertracker.app/event/?conf=DEFCON33&event=61513)_

In a world full of unwanted app updates and SaaS providers who want your
personal information, being able to self host the 120,000 Linux packages in
Nixpkgs has the potential to change the game for anyone who's tired of the slow
decline of cloud services. If you're curious about what NixOS can do for your
homelab, or even if you're just worried about SBOMs or traceability of exactly
where your software and all its dependencies came from, join us for an
hour-long panel on the DEF CON Community Stage about how we can reclaim our
services and software from vendor lockin and Docker image bitrot using Nix
and NixOS. We'll be doing a deep dive into why Nix changes software deployment,
and how you can get started and get involved in the quiet revolution that
has been reshaping how we use software.

## Getting to Top 250 on HtB with Nix and LLMs

[Rambo Anderson-You](https://sessionize.com/cooldadhacking), Red Team

In this talk, I'll walk through using Nix to declare several AI models full
access to my computer to climb the Hack The Box (HtB) leaderboard where I was
previously hardstuck on "Hacker" rank as a busy dad.

I'll go though my semiautonomous workflow where I am (not yet) automating
myself out of a job. I go through the problems of having to solve many CTF
challenges with limited time, and how combining Nix and AI can be an amazing
workflow solution for solving multiple CTF problems that can need multiple
testing environments.

Finally, I'll compare this custom Nix configuration to simply distros like Kali
and AthenaOS. I'll talk about how this transfers to more real world use. How
much of this can be used in things like pen tests, red teaming, or bug bounty
hunting?

## Learn Nix the Fun Way

[Farid Zakaria](https://sessionize.com/farid-zakaria), Software Engineer, PhD Student and Nix enthusiast

Learning Nix can be off-putting, as many introductions dive into complex
terminology and academic concepts, missing the chance to simplify Nix's
advantages. Having given talks both internally and externally, I've shifted to
showcasing fun, practical examples first, leaving the nuances for later. Join
me to see some straightforward examples of what Nix can offer and why it might
be worth adopting.

## Mesh Network Sidecars for NixOS services

[Wes Payne](https://sessionize.com/wes-payne), Co-host of LINUX Unplugged

Inspired by the popular container sidecar pattern, this talk demonstrates a
generic, open source NixOS module that brings the same security and isolation
to bare metal services. We’ll explore how to declaratively wrap any systemd
service, placing it in an isolated network namespace with its own mesh network
client (e.g., Tailscale or Netbird). This approach makes services securely
accessible on your mesh, fully firewalled from the host—no application changes
required. Good fit for folks exploring declarative infrastructure and looking
for practical ways to apply modern security patterns to their own servers.

## 0 to Infra in 100 Days: A Nix Speedrun

[Alex Decious](https://github.com/adeci), Software Engineer at Actionable Outcomes

What if learning Nix was like a speed-run?

A few months ago, I'd never touched Nix. Then my friend's brother told me about
PlanetNix at Scale22x. I flew from Florida to California with Nix on an old
laptop and only four days of flailing experience. I felt grossly under
prepared, but after the talks and meeting brilliant people, I was hooked.

Today, I'm building Nix infrastructure full-time and manage every device I own
declaratively with tools like Clan.

This talk maps my route from 'what the hell is a derivation?' to contributing
to Nix projects in 100 days. I'll share the exact learning path, struggles, and
wins. As someone close enough to remember the pain but far enough to have some
solutions, I'll crash-course some tough Nix concepts with live demos showing my
real usage.

For beginners and the Nix-curious, this can be a great launch point for YOUR
speed-run. Nix's learning curve is infamous, but with the right fundamentals
and some problem framing, it doesn't have to be.
