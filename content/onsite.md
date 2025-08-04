---
---

## Welcome to Nix Vegas

We have every package from the [world's largest software repository](https://search.nixos.org)
on machines here in this very room. Hopefully we've made it easy to get started.

### Getting Nix

Here's how you can get Nix on an existing Linux machine. Alternatively, you can
install NixOS, which comes with Nix.

#### Install Nix

{{ installNix() }}

#### Install NixOS with an ISO or SD image

{{ installNixos() }}

#### PXE boot your machine into NixOS

stuff

### Downloading packages from our binary cache

`nix-shell -p ghidra`
