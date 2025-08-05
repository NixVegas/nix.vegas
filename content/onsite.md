---
---

## Welcome to Nix Vegas

We have every package from the [world's largest software repository](https://search.nixos.org)
on machines here in this very room. Hopefully we've made it easy to get started.

## Nixpkgs {{nixpkgsRev()}}

We have a copy of [nixpkgs](https://github.com/nixpkgs), the world's largest and most up to date
Linux package repository by [many measures](https://repology.org/repositories/graphs):

- `nix-channel --remove nixpkgs`
- <code>nix-channel --add {{nixpkgsUrl()}} nixpkgs</code>
- `nix-channel --update`

Our version is <code>{{nixpkgsVersion()}}</code>, which corresponds to <code>{{nixpkgsRev()}}</code> -
click {{nixpkgsCommitLink(text="here")}} to see the corresponding commit on GitHub.

### Downloading packages from our binary cache

Our binary cache is at [https://cache.nixos.lv](https://cache.nixos.lv). If you're using our channel:

`nix-shell --option substituters https://cache.nixos.lv -p ghidra`

We use Let's Encrypt and pass through the ["official" Hydra binary cache key](https://github.com/NixOS/nixpkgs/blob/nixos-25.05/nixos/modules/config/nix.nix#L449),
so no more configuration is needed and you mostly don't have to trust us to serve you packages
except for accepting that you'll need to hit our infra to download them.
If you use the above version of nixpkgs, we will likely have what you want cached.

You can use [https://search.nixos.org](https://search.nixos.org) or
our local [nixos-pagefind](https://github.com/Jaculabilis/nixos-pagefind) built in the
[docs](/#docs) section to find packages.

### Trust but verify

While you could just grab {{getNixpkgs(text="our nixpkgs")}} following the above instructions,
you can also check that it's what we say it is yourself. (Installing random software at DEF CON
seems like a great idea, right)?

<code>diff -r $(nix-prefetch-url --print-path --unpack {{nixpkgsUrl()}} | tee /dev/stderr | tail -n1) $(nix-prefetch-url --print-path --unpack {{nixpkgsVerifyUrl()}} | tee /dev/stderr | tail -n1)</code>

You should just see versions that differ.

## NixOS {{ nixpkgsRev() }}

You can also download our images that are configured to use https://cache.nixos.lv
as their primary substituter to retrieve packages.

If you take this config offsite, [https://cache.nixos.lv](https://cache.nixos.lv) will
transparently proxy you to [https://cache.nixos.org](https://cache.nixos.org), though
you may want to still change your [substituter preference](https://search.nixos.org/options?channel=25.05&from=0&size=50&sort=relevance&type=packages&query=nix.settings.substituters)
to cache.nixos.org in case we take the server down.

### ISOs

{{ nixosIsos() }}

### Proxmox Images

{{ nixosProxmoxImages() }}

### Docs

{{ nixosDocs() }}

#### PXE boot your machine into NixOS

Our DHCP servers all serve the same config as the above ISOs via NixOS netboot.
Boot into PXE while plugged into one and you'll boot directly into NixOS.

