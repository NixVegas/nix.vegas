---
---

## Welcome to Nix Vegas

We have every package from the [world's largest software repository](https://search.nixos.org)
on machines here in this very room. Hopefully we've made it easy to get started.

{{ installNixos() }}

#### PXE boot your machine into NixOS

Our DHCP servers all serve the above ISOs via NixOS netboot. Boot into PXE while plugged into one and you'll boot directly into NixOS.

### Downloading packages from our binary cache

Our binary cache is at [https://cache.nixos.lv](https://cache.nixos.lv). Something like this will work:

`nix-shell --option substituters https://cache.nixos.lv -p ghidra`

We use Let's Encrypt and the "official" hydra binary cache key, so no more configuration is needed.

Make sure you're using the right version of nixpkgs; that is {{ nixpkgsVersion() }}.
