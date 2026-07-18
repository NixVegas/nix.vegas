---
template: "onsite.html"
title: "Onsite"
---

## Welcome to Nix Vegas

We have every package from the [world's largest software repository](https://search.nixos.org)
on machines here in this very room. Hopefully we've made it easy to get started.

### On the network

Once you're on our Wi-Fi or plugged in, everything below lives on the event
network and loads at LAN speed. Start here:

- **CTF:** [https://nixc.tf](https://nixc.tf). The fastest way in, and a gentle
  intro to Nix that hands you your own VMs to play with. Capture the flag.
- **Git server:** [https://git.nixos.lv](https://git.nixos.lv). Our Forgejo,
  mirroring [NixOS/nixpkgs](https://git.nixos.lv/NixOS/nixpkgs) so you can browse
  and clone at LAN speed. The exact revision our cache is built against:
  {{nixpkgsCommitLink()}}.
- **Package search:** our [local NixOS search](#docs) instance, no internet
  round-trip, plus [https://search.nixos.org](https://search.nixos.org).
- **Manual:** the [NixOS manual](#docs), a local copy.
- **ISOs and images:** [installer ISOs, SD cards, and Proxmox images](#isos)
  preconfigured to use our cache, or [PXE boot straight into NixOS](#pxe-boot-your-machine-into-nixos)
  from any of our DHCP networks.
- **Our nixpkgs and cache:** add our channel and point Nix at
  [https://cache.nixos.lv](https://cache.nixos.lv) so packages install from the
  room instead of the venue uplink. [Set it up](#downloading-packages-from-our-binary-cache).
- **Live stream:** [https://live.nixos.lv](https://live.nixos.lv). The main
  stage, if you stepped out.

## Nixpkgs {{nixpkgsRev()}}

We have a copy of [nixpkgs](https://git.nixos.lv/NixOS/nixpkgs), the world's largest and most up to date
Linux package repository by [many measures](https://repology.org/repositories/graphs):

- `nix-channel --remove nixpkgs`
- <code>nix-channel --add {{nixpkgsUrl()}} nixpkgs</code>
- `nix-channel --update`

Our version is <code>{{nixpkgsVersion()}}</code>, which corresponds to <code>{{nixpkgsRev()}}</code>;
click {{nixpkgsCommitLink(text="here")}} to see that commit on our own Git server.

### Downloading packages from our binary cache

Our local binary cache is at [https://cache.nixos.lv](https://cache.nixos.lv). It serves
everything we've built and fetched for the event, straight from our store over the
event network. If you're using our channel:

`nix-shell --option substituters https://cache.nixos.lv -p ghidra`

We use Let's Encrypt and pass through the ["official" Hydra binary cache key](https://github.com/NixOS/nixpkgs/blob/nixos-26.05/nixos/modules/config/nix.nix),
so no more configuration is needed and you mostly don't have to trust us to serve you packages
except for accepting that you'll need to hit our infra to download them.
If you use the above version of nixpkgs, we will likely have what you want cached.
If we don't, cache.nixos.lv fetches it from
[https://cache.nixos.org](https://cache.nixos.org) for you on the fly and keeps a
copy for the next person, so it only crosses the venue uplink once.

You can use [https://search.nixos.org](https://search.nixos.org) or
our local [nixos-pagefind](https://github.com/Jaculabilis/nixos-pagefind) built in the
[docs](#docs) section to find packages.

### Trust but verify

While you could just grab {{getNixpkgs(text="our nixpkgs")}} following the above instructions,
you can also check that it's what we say it is yourself. (Installing random software at DEF CON
seems like a great idea, right)?

<code>diff -r $(nix-prefetch-url --print-path --unpack {{nixpkgsUrl()}} | tee /dev/stderr | tail -n1) $(nix-prefetch-url --print-path --unpack {{nixpkgsVerifyUrl()}} | tee /dev/stderr | tail -n1)</code>

You should just see versions that differ.

## NixOS {{ nixpkgsRev() }}

You can also download our images that are configured to use https://cache.nixos.lv
as their primary substituter to retrieve packages.

### ISOs

{{ nixosIsos() }}

### Proxmox Images

{{ nixosProxmoxImages() }}

### Docs

{{ nixosDocs() }}

#### PXE boot your machine into NixOS

Our DHCP servers all serve the same config as the above ISOs via NixOS netboot.
Boot into PXE while plugged into one and you'll boot directly into NixOS.
